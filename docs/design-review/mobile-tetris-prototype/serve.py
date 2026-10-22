"""Throwaway prototype only: python3 docs/design-review/mobile-tetris-prototype/serve.py"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path

if __name__ == '__main__':
    directory = str(Path(__file__).resolve().parent)
    print('NeowFocus motion prototype: http://127.0.0.1:8782/?variant=A', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8782), partial(SimpleHTTPRequestHandler, directory=directory)).serve_forever()
