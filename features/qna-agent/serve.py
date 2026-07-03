#!/usr/bin/env python3
"""Zero-dependency HTTP server for qna-agent.

Binds to 127.0.0.1 by default. Blocks direct access to /config/ directory.
Serves ake.json via /ake.json endpoint. Supports PUT for config/memory writes.

Usage:
    python3 serve.py [--port PORT] [--bind ADDR]
"""

import http.server
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 3100

PLACEHOLDERS = {"<PLACEHOLDER>", ""}

PROXY_ENDPOINTS = ("/chat/completions", "/messages")

AKE_JSON_PATH = "config/ake.json"

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".markdown": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".ttf": "font/ttf",
}


class QnaHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler with path filtering and write endpoints."""

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/ake.json":
            return self._serve_ake_json()
        if path.startswith("/config/"):
            self.send_error(403, "Forbidden")
            return
        return super().do_GET()

    def do_PUT(self):
        path = self.path.split("?")[0]
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length else b""

        write_paths = {
            "/knowledge-sources.json": "agent/knowledge-sources.json",
            "/memory/persistent.json": "agent/memory/persistent.json",
        }

        if path in write_paths:
            filepath = SCRIPT_DIR / write_paths[path]
            filepath.parent.mkdir(parents=True, exist_ok=True)
            try:
                data = json.loads(body) if body else {}
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                self._send_json({"ok": True, "path": write_paths[path]})
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON")
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(405, "Method Not Allowed")

    def do_POST(self):
        path = self.path.split("?")[0]
        if path in PROXY_ENDPOINTS:
            return self._proxy_llm(path)
        self.send_error(404, "Not Found")

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, x-api-key, anthropic-version",
        )
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.end_headers()

    def _send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def _serve_ake_json(self):
        filepath = SCRIPT_DIR / AKE_JSON_PATH
        if not filepath.exists():
            self.send_error(404, "Not Found")
            return
        try:
            with open(filepath, "rb") as f:
                data = self._redact_api_key(f.read())
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", len(data))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_error(500, str(e))

    @staticmethod
    def _redact_api_key(raw):
        """Replace a real llm.apiKey with a sentinel so it never reaches the
        browser. Placeholder/empty keys are left untouched so the UI falls back
        to Mock."""
        try:
            cfg = json.loads(raw)
        except Exception:
            return raw
        llm = cfg.get("llm")
        if isinstance(llm, dict) and llm.get("apiKey") not in PLACEHOLDERS:
            llm["apiKey"] = "configured"
            return json.dumps(cfg, ensure_ascii=False).encode("utf-8")
        return raw

    def _proxy_llm(self, path):
        base_url, api_key = self._load_llm_credentials()
        if not base_url or not api_key:
            self.send_error(502, "LLM API not configured in ake.json")
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b""

        target = base_url.rstrip("/") + path
        headers = {"Content-Type": "application/json"}
        if path == "/messages":
            headers["x-api-key"] = api_key
            headers["anthropic-version"] = "2023-06-01"
        else:
            headers["Authorization"] = f"Bearer {api_key}"

        req = urllib.request.Request(target, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as upstream:
                self.send_response(upstream.status)
                self.send_header(
                    "Content-Type",
                    upstream.headers.get("Content-Type", "text/event-stream"),
                )
                self.end_headers()
                self._stream(upstream)
        except urllib.error.HTTPError as e:
            err_body = e.read()
            self.send_response(e.code)
            self.send_header(
                "Content-Type", e.headers.get("Content-Type", "application/json")
            )
            self.send_header("Content-Length", len(err_body))
            self.end_headers()
            self.wfile.write(err_body)
        except urllib.error.URLError as e:
            self.send_error(502, f"Upstream unreachable: {e.reason}")

    def _stream(self, upstream):
        while True:
            chunk = upstream.read(1024)
            if not chunk:
                break
            self.wfile.write(chunk)
            self.wfile.flush()

    @staticmethod
    def _load_llm_credentials():
        filepath = SCRIPT_DIR / AKE_JSON_PATH
        if not filepath.exists():
            return None, None
        try:
            with open(filepath, "rb") as f:
                cfg = json.loads(f.read())
        except Exception:
            return None, None
        llm = cfg.get("llm", {})
        base_url = llm.get("baseURL")
        api_key = llm.get("apiKey")
        if base_url in PLACEHOLDERS or api_key in PLACEHOLDERS:
            return None, None
        return base_url, api_key

    def log_message(self, format, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format % args))


def main():
    host = DEFAULT_HOST
    port = DEFAULT_PORT

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--port" and i + 1 < len(args):
            port = int(args[i + 1])
            i += 2
        elif args[i] == "--bind" and i + 1 < len(args):
            host = args[i + 1]
            i += 2
        else:
            i += 1

    os.chdir(SCRIPT_DIR)
    server = http.server.HTTPServer((host, port), QnaHandler)
    print(f"qna-agent server running at http://{host}:{port}/ui_lite/")
    print(f"Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
