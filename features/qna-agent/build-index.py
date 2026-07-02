#!/usr/bin/env python3
"""Build inverted index for qna-agent knowledge sources.

Walks agent/knowledge/ recursively, parses markdown, extracts sections
by ## headers, tokenizes content, and builds an inverted index mapping
tokens to source-section pairs with TF scores.

Output: agent/knowledge-index.json

Usage:
    python3 build-index.py [--force] [--knowledge-dir PATH] [--output PATH]
"""

import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_KNOWLEDGE_DIR = SCRIPT_DIR / "agent" / "knowledge"
DEFAULT_OUTPUT = SCRIPT_DIR / "agent" / "knowledge-index.json"


def tokenize(text):
    """Simple tokenizer: split on whitespace, lowercase, filter short tokens."""
    tokens = []
    for token in text.lower().split():
        token = token.strip(".,;:!?\"'()[]{}<>/\\|`~@#$%^&*+=_-")
        if len(token) >= 2:
            tokens.append(token)
    return tokens


def parse_markdown_sections(content):
    """Extract sections from markdown by ## headers."""
    sections = {}
    lines = content.split("\n")
    current_section = "_top_"
    current_content = []

    for line in lines:
        if re.match(r"^##\s+", line):
            if current_content:
                sections[current_section] = "\n".join(current_content).strip()
            current_section = line.strip()
            current_content = []
        else:
            current_content.append(line)

    if current_content:
        sections[current_section] = "\n".join(current_content).strip()

    if not sections and current_content:
        sections["_top_"] = content.strip()

    return sections


def get_file_info(filepath, rel_path):
    """Get file metadata including title from first # header."""
    title = os.path.splitext(os.path.basename(filepath))[0]
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            for line in content.split("\n"):
                if re.match(r"^#\s+", line.strip()):
                    title = line.strip().lstrip("#").strip()
                    break
    except Exception:
        pass
    return title


def build_index(knowledge_dir, output_path=None, force=False):
    """Build inverted index from knowledge directory."""
    if output_path is None:
        output_path = DEFAULT_OUTPUT
    knowledge_dir = Path(knowledge_dir)
    output_path = Path(output_path)

    if not knowledge_dir.exists():
        print(f"Warning: knowledge directory not found: {knowledge_dir}", file=sys.stderr)
        output = {
            "version": 1,
            "built": _now(),
            "sources": {},
            "inverted": {},
        }
        _write_index(output_path, output)
        print(f"Index written: {output_path} (empty)")
        return output

    files = {}
    for ext in (".md", ".markdown"):
        for f in knowledge_dir.rglob(f"*{ext}"):
            files[f] = f.relative_to(knowledge_dir.parent)

    if not files:
        print(f"No markdown files found in {knowledge_dir}", file=sys.stderr)
        output = {"version": 1, "built": _now(), "sources": {}, "inverted": {}}
        _write_index(output_path, output)
        return output

    if not force and not _needs_rebuild(files, output_path):
        print("No changes detected, index is up to date.")
        return None

    sources = {}
    inverted = {}

    for filepath, rel_path in files.items():
        rel_str = str(rel_path).replace("\\", "/")
        source_type = rel_path.parts[1] if len(rel_path.parts) > 2 else "unknown"
        title = get_file_info(filepath, rel_str)

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"Warning: could not read {filepath}: {e}", file=sys.stderr)
            continue

        sections = parse_markdown_sections(content)
        file_bytes = filepath.stat().st_size

        source_entry = {
            "title": title,
            "type": source_type,
            "bytes": file_bytes,
            "sections": {},
        }

        for section_name, section_content in sections.items():
            tokens = tokenize(section_content)
            token_counts = Counter(tokens)
            preview = section_content[:200]
            if len(section_content) > 200:
                preview += "..."

            source_entry["sections"][section_name] = {
                "preview": preview,
                "token_count": len(tokens),
            }

            total_tokens = len(tokens) if tokens else 1
            for token, count in token_counts.items():
                tf = count / total_tokens
                if token not in inverted:
                    inverted[token] = []
                inverted[token].append({
                    "source": rel_str,
                    "section": section_name,
                    "tf": round(tf, 4),
                })

        sources[rel_str] = source_entry

    output = {
        "version": 1,
        "built": _now(),
        "sources": sources,
        "inverted": inverted,
    }

    _write_index(output_path, output)
    print(f"Index written: {output_path}")
    print(f"  Sources: {len(sources)} files, {sum(len(s['sections']) for s in sources.values())} sections")
    print(f"  Unique tokens in inverted index: {len(inverted)}")
    return output


def _write_index(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _needs_rebuild(files, index_path):
    if not index_path.exists():
        return True
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
    except Exception:
        return True

    existing_sources = set(existing.get("sources", {}).keys())

    current_sources = set()
    current_mtimes = {}
    for filepath, rel_path in files.items():
        rel_str = str(rel_path).replace("\\", "/")
        current_sources.add(rel_str)
        current_mtimes[rel_str] = filepath.stat().st_mtime

    if current_sources != existing_sources:
        return True

    if "source_mtimes" in existing:
        for src, mtime in existing["source_mtimes"].items():
            if src in current_mtimes and current_mtimes[src] != mtime:
                return True

    return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Build inverted index for qna-agent")
    parser.add_argument("--force", action="store_true", help="Force rebuild even if unchanged")
    parser.add_argument("--knowledge-dir", default=str(DEFAULT_KNOWLEDGE_DIR), help="Knowledge directory path")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Output index JSON path")
    args = parser.parse_args()

    os.chdir(SCRIPT_DIR)
    build_index(args.knowledge_dir, output_path=args.output, force=args.force)
