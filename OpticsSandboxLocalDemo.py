#!/usr/bin/env/python2

import SimpleHTTPServer, SocketServer, webbrowser

PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
webbrowser.open_new_tab("http://localhost:"+str(PORT)+"/OpticsSandboxExample.html")
httpd.serve_forever()
