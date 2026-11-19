# HESchema website

A static HTML and CSS site with one small vanilla JavaScript playground. Serve
this directory as the web root. The static playground shows recorded outcomes
for the supplied example inputs.

For editable live validation, follow the Quickstart to install the pinned
HESchema revision, then run `python serve.py` and open
http://127.0.0.1:8000/playground/. The Python server is for loopback development.

The examples in `examples.json` are based on HESchema's vocabulary
conformance cases, with a citation example for localReferences. Their recorded
outcomes were produced by HESchema's Python SchemaEngine. Expression examples
illustrate experimental syntax and do not run in the native playground.
