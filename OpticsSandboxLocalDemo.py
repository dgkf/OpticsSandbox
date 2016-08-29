#!/usr/bin/env python

import sys
assert sys.version_info >= (2,5)

PORT = 8000

if sys.version_info >= (3,0):
    print "running with python3"

else:
    import SimpleHTTPServer, SocketServer, webbrowser

    print "running with python2"
    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("", PORT), Handler)

    print "serving at port", PORT
    webbrowser.open_new_tab("http://localhost:"+str(PORT)+"/OpticsSandboxExample.html")
    httpd.serve_forever()
