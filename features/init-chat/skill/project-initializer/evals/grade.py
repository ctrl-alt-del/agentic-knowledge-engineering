#!/usr/bin/env python3
"""Grade project-initializer skill outputs against assertions."""
import json, sys, os, re, jsonschema

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "..", "references", "output-schema.json")

def load_schema():
    with open(SCHEMA_PATH) as f:
        return json.load(f)

def extract_json_from_output(output_path):
    """Extract the final JSON from the subagent's output."""
    for root, _, files in os.walk(output_path):
        for f in files:
            if f.endswith(".json") and f not in ("timing.json", "grading.json", "metrics.json", "eval_metadata.json"):
                path = os.path.join(root, f)
                try:
                    with open(path) as fh:
                        data = json.load(fh)
                    if "project_name" in data and "description" in data and "custom" in data:
                        return data
                except (json.JSONDecodeError, Exception):
                    continue
    return None

def check_output_txt(output_path):
    """Scan text output for a JSON code block."""
    for root, _, files in os.walk(output_path):
        for f in files:
            if f.endswith(".txt") or f.endswith(".md"):
                path = os.path.join(root, f)
                try:
                    with open(path) as fh:
                        content = fh.read()
                    match = re.search(r'```(?:json)?\s*\n(.*?)\n```', content, re.DOTALL)
                    if match:
                        return json.loads(match.group(1))
                except (json.JSONDecodeError, Exception):
                    continue
    return None

def load_output(output_path):
    """Try to load the output JSON from the run directory."""
    data = extract_json_from_output(output_path)
    if data is None:
        data = check_output_txt(output_path)
    return data

def grade_assertions(output_path, eval_id):
    """Grade all assertions for a given eval."""
    data = load_output(output_path)
    if data is None:
        return [{"text": "valid_output_json", "passed": False, "evidence": "No valid JSON output found"}]

    schema = load_schema()
    results = []

    def check(name, passed, evidence=""):
        results.append({"text": name, "passed": passed, "evidence": evidence})

    # 1: valid_output_json
    try:
        jsonschema.validate(data, schema)
        check("valid_output_json", True, "Output passes JSON Schema validation")
    except Exception as e:
        check("valid_output_json", False, str(e))
        return results

    # 2: project_name_length
    name = data.get("project_name", "")
    ok = 1 <= len(name) <= 20
    check("project_name_length", ok, f"name='{name}' len={len(name)}")

    # 3: description_length
    desc = data.get("description", "")
    ok = 1 <= len(desc) <= 50
    check("description_length", ok, f"desc='{desc}' len={len(desc)}")

    # 4: all_required_fields
    required = schema.get("required", [])
    missing = [f for f in required if f not in data or data.get(f) is None]
    check("all_required_fields", len(missing) == 0, f"missing={missing}" if missing else "all present")

    # 5: template_enum_valid
    tpl = data.get("template", "")
    ok = tpl in ("template-1", "template-2", "template-3")
    check("template_enum_valid", ok, f"template={tpl}")

    # 6: repo_mode_enum
    custom = data.get("custom", {})
    crk = custom.get("code_reverse_knowledge", {})
    if crk.get("enabled"):
        mode = crk.get("mode", "")
        ok = mode in ("single", "multi")
        check("repo_mode_enum", ok, f"mode={mode}")
    else:
        check("repo_mode_enum", True, "code_reverse_knowledge not enabled, skipped")

    # 7: no_hardcoded_urls
    raw = json.dumps(data)
    has_mcp = bool(re.search(r'https?://[^/]*mcp', raw)) or "<MCP_SERVER>" in raw
    check("no_hardcoded_urls", not has_mcp, "No hardcoded MCP URLs found" if not has_mcp else "Found hardcoded MCP URL")

    # 8: repo_url_format
    all_urls = []
    for section in ["document_forward_knowledge", "code_reverse_knowledge"]:
        section_data = data.get(section, {})
        if isinstance(section_data, dict):
            repos = section_data.get("repositories") or section_data.get("github") or []
            all_urls.extend([r["url"] for r in repos if "url" in r])
    bad = [u for u in all_urls if not re.match(r'^https://github\.com/[\w.-]+/[\w.-]+$', u)]
    check("repo_url_format", len(bad) == 0, f"bad_urls={bad}" if bad else f"all {len(all_urls)} URLs valid")

    # 9: custom_at_least_one
    enabled = []
    for key in ("document_forward_knowledge", "code_reverse_knowledge", "capsule_knowledge", "cross_domain_knowledge_graph"):
        if custom.get(key, {}).get("enabled"):
            enabled.append(key)
    check("custom_at_least_one", len(enabled) >= 1, f"enabled={enabled}")

    # Eval-specific assertions
    if eval_id == 2:  # expert-custom
        check("capsule_local_upload", data.get("capsule_knowledge", {}).get("local_upload") == True, "local_upload enabled")
        check("custom_exact_two", len(enabled) == 2 and "code_reverse_knowledge" in enabled and "capsule_knowledge" in enabled, f"enabled={enabled}")

    if eval_id == 3:  # full-ecosystem
        check("template_is_1", tpl == "template-1", f"template={tpl}")
        check("all_capabilities_enabled", len(enabled) == 4, f"enabled={enabled}")
        docs = data.get("document_forward_knowledge", {}).get("github", [])
        check("multi_repo_docs", len(docs) == 2, f"doc repos={len(docs)}")
        code = data.get("code_reverse_knowledge", {}).get("repositories", [])
        check("multi_repo_code", len(code) == 2, f"code repos={len(code)}")
        cap = data.get("capsule_knowledge", {})
        check("capsule_both", cap.get("log_extraction_api") is not None and cap.get("local_upload") == True, f"capsule={cap}")

    if eval_id == 4:  # resume-partial
        check("project_name_preserved", name == "临时项目", f"name={name}")
        check("description_preserved", desc == "测试", f"desc={desc}")
        check("template_is_2", tpl == "template-2", f"template={tpl}")

    return results

def main():
    if len(sys.argv) < 3:
        print("Usage: python grade.py <output_path> <eval_id>")
        sys.exit(1)

    output_path = sys.argv[1]
    eval_id = int(sys.argv[2])
    results = grade_assertions(output_path, eval_id)

    passed = sum(1 for r in results if r["passed"])
    total = len(results)

    print(json.dumps({
        "expectations": results,
        "summary": {"passed": passed, "failed": total - passed, "total": total, "pass_rate": passed / total if total else 0}
    }, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
