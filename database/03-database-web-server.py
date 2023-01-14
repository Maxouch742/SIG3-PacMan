#!/usr/bin/python3

import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import json
import psycopg2

hostName = "localhost"
hostPort = 5433

class MyServer(BaseHTTPRequestHandler):

	# Connexion à la base de données
	data = {}
	try:
		conn = psycopg2.connect("dbname='pacman_hopital' user='postgres' host='localhost' password='postgres'")
		cursor = conn.cursor()
	except:
		print("I am unable to connect to the database")

	# Contient les headers standards pour répondre du JSON
	def _set_headers(self):
		self.send_header('Access-Control-Allow-Origin', '*')
		self.send_header('Content-Type', 'application/json')
		self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
		self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
		self.send_header('Access-Control-Allow-Headers', 'Content-Type')
		self.end_headers()

	# Nécessaire pour le POST.
	def do_OPTIONS(self):
		self.send_response(200)
		self._set_headers()

	#	GET
	def do_GET(self):
		self.cursor.execute("SELECT osm_id from roads_quartierHopital_clean;")
		self.data = self.cursor.fetchall()

		self.send_response(200)
		self._set_headers()
		# json.dumps converti le dictionnaire python en JSON
		self.wfile.write(bytes(json.dumps(self.data), "utf-8"))

	#	POST is for submitting data.
	def do_POST(self):
		content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
		post_data = self.rfile.read(content_length) # <--- Gets the data itself

		print("Le serveur a reçu un POST!", self.path, post_data)

		# on lit le JSON et on ajoute l'objet au tableau des personnages
		new_city = json.loads(post_data.decode('utf8'))

		self.cursor.execute(
			"INSERT INTO dummy.cities VALUES (DEFAULT, %s, %s, 'SRID=2056;POINT(%s %s)')",
			(new_city["nom"], new_city["img"], new_city["E"], new_city["N"])
		)
		# Le commit est nécessaire pour sauver les modifications dans la base de données
		self.conn.commit()
		self.cursor.execute("SELECT name, img, ST_AsText(geom) from dummy.cities")
		self.data = self.cursor.fetchall()

		self.send_response(201)
		self._set_headers()
		self.wfile.write(bytes(json.dumps(self.data), "utf-8"))


myServer = HTTPServer((hostName, hostPort), MyServer)
print(time.asctime(), "Server Starts - %s:%s" % (hostName, hostPort))

try:
	myServer.serve_forever()
except KeyboardInterrupt:
	pass

myServer.server_close()
print(time.asctime(), "Server Stops - %s:%s" % (hostName, hostPort))
