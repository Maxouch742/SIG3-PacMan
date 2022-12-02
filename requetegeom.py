import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import json
import psycopg2

# Paramètre du serveur de la base de données
hostName = "localhost"
hostPort = 8000

class MyServer(BaseHTTPRequestHandler) :

    # Connexion à la base de données
    data = {}
    try:
        conn = psycopg2.connect(dbname="pacman_hopital",
                                user="postgres",
                                password="postgres",
                                host="localhost",
                                port="5433")
        cursor = conn.cursor()
        print("Connexion DB : réussie")
    except:
        print("Connexion DB : échec")


    # Headers standards pour répondre du JSON
    def _set_headers(self) :
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # Méthode utile pour le GET
    def do_GET(self) :
        # Exécution de la requête et réception des données
        self.cursor.execute("SELECT osm_id, ST_AsGeoJSON(geom) FROM public.roads_quartierHopital_clean;")
        self.data = self.cursor.fetchall()

        print(self.data)
        
        self.send_response(200)
        self._set_headers()
        # conversion dict in JSON et écriture du fichier
        self.wfile.write(bytes(json.dumps(self.data), "utf-8"))


if __name__ == "__main__" :
    myServer = HTTPServer((hostName, hostPort), MyServer)
    print("-> ",time.asctime(), "Server starts - %s:%s" % (hostName, hostPort))

    try:
        myServer.serve_forever()
    except KeyboardInterrupt:
        pass

    myServer.server_close()
    print("-> ",time.asctime(), "Server stops - %s:%s" % (hostName, hostPort))