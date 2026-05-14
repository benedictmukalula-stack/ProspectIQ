#!/usr/bin/env python3
"""
Post-build patch for Next.js standalone server.

In containerized environments, HOSTNAME is set to the container ID (e.g. c-6a05aaa4...).
Next.js standalone uses `process.env.HOSTNAME || '0.0.0.0'` for the listen address,
which causes request.url to resolve to an unreachable 0.0.0.0 URL in redirect responses.

This script patches server.js to use a dedicated env var (NEXT_SERVER_HOSTNAME)
instead of HOSTNAME, falling back to 0.0.0.0 for backward compatibility.
"""

import sys
from pathlib import Path

def patch_standalone_server(server_js_path: str) -> bool:
    path = Path(server_js_path)
    if not path.exists():
        print(f"ERROR: {server_js_path} not found")
        return False

    content = path.read_text()
    old = "const hostname = process.env.HOSTNAME || '0.0.0.0'"
    new = "const hostname = process.env.NEXT_SERVER_HOSTNAME || '0.0.0.0'"

    if old not in content:
        print(f"WARNING: hostname line not found in {server_js_path} (may already be patched)")
        return True

    content = content.replace(old, new)
    path.write_text(content)
    print(f"Patched {server_js_path}: HOSTNAME -> NEXT_SERVER_HOSTNAME")
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else ".next/standalone/server.js"
    success = patch_standalone_server(target)
    sys.exit(0 if success else 1)
