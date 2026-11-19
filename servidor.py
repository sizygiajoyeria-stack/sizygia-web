import http.server, os, sys
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory="site",**k)
    def do_GET(self):
        p=self.path.split("?")[0]
        if p!="/" and "." not in os.path.basename(p) and os.path.exists("site"+p+".html"):
            self.path=p+".html"+(("?"+self.path.split("?",1)[1]) if "?" in self.path else "")
        return super().do_GET()
    def log_message(self,*a): pass
http.server.ThreadingHTTPServer(("127.0.0.1",8765),H).serve_forever()
