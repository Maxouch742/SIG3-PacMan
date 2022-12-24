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
        print("Connexion DB : reussie")
    except:
        print("Connexion DB : echec")


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
        self.cursor.execute("SELECT osm_id, ST_AsText(geom) FROM public.roads_quartierHopital_clean;")
        """ SELECT st_astext(st_transform(geom, 2056)) from roads_quartierHopital_clean; """
        self.data = self.cursor.fetchall()

        print(self.data)
        data_list = []
        for element in self.data : 
            data_list.append({'osm_id':element[0],
                              'coordinates':element[1]})
        print('---------------------------------------------')
        print(data_list)
        data_json = json.dumps(data_list)
        print('----------------------------------------------')
        print(data_json)

        #liste_element = []
        #for element in self.data :
        #    print(element[0])
        #    liste_element.append(element[0])
        
        self.send_response(200)
        self._set_headers()
        # conversion dict in JSON et écriture du fichier
        self.wfile.write(bytes(data_json, "utf-8"))


if __name__ == "__main__" :
    myServer = HTTPServer((hostName, hostPort), MyServer)
    print("-> ",time.asctime(), "Server starts - %s:%s" % (hostName, hostPort))

    try:
        myServer.serve_forever()
    except KeyboardInterrupt:
        pass

    myServer.server_close()
    print("-> ",time.asctime(), "Server stops - %s:%s" % (hostName, hostPort))