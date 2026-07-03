#!/usr/bin/env python3
"""Zero-dependency HTTP server for init-chat.

Binds to 127.0.0.1 by default. Serves ake.json from project root (secure:
ake.json is outside the static file serving directory). Serves ui_lite/ as
the chat UI and skill/ as the skill loader.

Usage:
    python3 serve.py [--port PORT] [--bind ADDR]
"""

import http.server
import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 3000

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

BLOCKED_PREFIXES = [
    "/ake.json/",
    "/.git/",
    "/config/",
]


class InitChatHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that serves /ake.json from project root."""

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/ake.json":
            return self._serve_ake_json()

        for prefix in BLOCKED_PREFIXES:
            if path.startswith(prefix):
                self.send_error(403, "Forbidden")
                return

        return super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _serve_ake_json(self):
        filepath = (PROJECT_ROOT / "ake.json").resolve()
        if not str(filepath).startswith(str(PROJECT_ROOT.resolve())):
            self.send_error(403, "Forbidden")
            return
        if not filepath.exists():
            self.send_error(404, "Not Found")
            return
        try:
            with open(filepath, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", len(data))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_error(500, str(e))

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
    server = http.server.HTTPServer((host, port), InitChatHandler)
    print(f"init-chat server running at http://{host}:{port}/ui_lite/")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
