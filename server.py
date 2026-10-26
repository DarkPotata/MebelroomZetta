import http.server
import socketserver
import os

PORT = 8000

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Если запрашиваемого файла не существует на диске,
        # перенаправляем запрос на корневой index.html
        if not os.path.exists(self.translate_path(self.path)):
            self.path = '/index.html'
        return super().do_GET()

with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"Сервер запущен на http://localhost:{PORT}")
    httpd.serve_forever()