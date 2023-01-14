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
    def do_GET(self, param) :
        print(param)
        # Exécution de la requête et réception des données
        self.cursor.execute("SELECT st_astext(st_transform(geom, 2056)), source, target FROM public.roads_quartierHopital_clean LIMIT 1;")
        """ SELECT st_astext(st_transform(geom, 2056)) from roads_quartierHopital_clean; """
        self.data = self.cursor.fetchall()

        print(self.data)

        data = self.data[0]
        liste_coor_str = data[0]
        liste_coor_str = liste_coor_str[17:len(liste_coor_str)-2].split(',')
        coordinates = []
        for element in liste_coor_str :
            data_element = element.split(' ')
            coordinates.append([float(data_element[0]),float(data_element[1])])
        data_export = {}
        data_export.update({'coordinates':coordinates})
        data_export.update({'source':data[1]})
        data_export.update({'target':data[2]})
        print(data_export)
        
        self.send_response(200)
        self._set_headers()
        # conversion dict in JSON et écriture du fichier
        self.wfile.write(bytes(json.dumps(data_export), "utf-8"))


if __name__ == "__main__" :
    myServer = HTTPServer((hostName, hostPort), MyServer)
    print("-> ",time.asctime(), "Server starts - %s:%s" % (hostName, hostPort))

    try:
        myServer.serve_forever()
    except KeyboardInterrupt:
        pass

    myServer.server_close()
    print("-> ",time.asctime(), "Server stops - %s:%s" % (hostName, hostPort))