"""Serve the site and its native validator on loopback for local development."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
import json

from heschema.jsonio import loads
from heschema.schema import SchemaEngine

ROOT = Path(__file__).resolve().parent

class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/validate":
            self.send_error(404)
            return
        if self.headers.get("Origin") not in (None, "http://127.0.0.1:8000"):
            self.send_error(403)
            return
        try:
            size = int(self.headers.get("Content-Length", 0))
            if self.headers.get_content_type() != "application/json" or not 0 < size <= 131072:
                raise ValueError("Send JSON up to 128 KiB.")
            request = loads(self.rfile.read(size).decode())
            schema = loads(request["schema"])
            instance = loads(request["data"])
            errors = SchemaEngine().errors(schema, instance)
            body = {"valid": not errors, "errors": errors}
        except (ValueError, KeyError, TypeError, RecursionError) as exc:
            body = {"error": str(exc)}
        response = json.dumps(body, ensure_ascii=True).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

if __name__ == "__main__":
    with HTTPServer(("127.0.0.1", 8000), partial(Handler, directory=str(ROOT))) as server:
        server.serve_forever()
