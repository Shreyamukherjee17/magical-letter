import http.server
import os
import sys

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PORT = 8000

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stderr.flush()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    # Dual-binding support: listen on all interfaces
    server_address = ('', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, QuietHandler)
    sys.stderr.write(f"Server started on port {PORT}\n")
    sys.stderr.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
