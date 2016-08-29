#!/usr/bin/env python

import sys
assert sys.version_info >= (2,5)

PORT = 8000

# for python3
if sys.version_info >= (3,0):
    print("running with python3")
    import http.server, socketserver, webbrowser

    Handler = http.server.SimpleHTTPRequestHandler

    while True:
        print("Attempting to serve at port", PORT)
        try:
            httpd = socketserver.TCPServer(("", PORT), Handler)
            webbrowser.open_new_tab("http://localhost:"+str(PORT)+"/OpticsSandboxExample.html")
            httpd.serve_forever()
            break
        except SocketServer.socket.error as e:
            response = raw_input("Web socket is already in use! What port should be used instead?\n  new port: ")

            try:
                PORT = int(response)
            finally:
                print("Invalid reponse! Attempting with same settings.")
        finally:
            pass


# for python2
else:
    print("running with python2")
    import SimpleHTTPServer, SocketServer, webbrowser

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

    while True:
        print("Attempting to serve at port", PORT)
        try:
            httpd = SocketServer.TCPServer(("", PORT), Handler)
            webbrowser.open_new_tab("http://localhost:"+str(PORT)+"/OpticsSandboxExample.html")
            httpd.serve_forever()
            break
        except SocketServer.socket.error as e:
            response = raw_input("Web socket is already in use! What port should be used instead?\n  new port: ")

            try:
                PORT = int(response)
            finally:
                print("Invalid reponse! Attempting with same settings.")
        finally:
            pass
