import json
from shapely.geometry import *
from shapely.ops import *
import numpy as np


file = open("C:/0_HEIGVD/Cours/SIG/SIG3/SIG3-PacMan/quartierHopital_MN95.geojson", "r")
data = json.load(file)


res = {}
res.update({"type":"FeatureCollection"})
res.update({"features":[]})


## Parcours des routes
for element in data['features'] :
    
    coord = element["geometry"]["coordinates"][0]
    print("\nNouvelle route :")
    print(coord)
    
    line = LineString((coord))
    
    distance_delta = 10
    mp = MultiPoint()
    for i in np.arange(0, line.length, distance_delta):
        s = substring(line, i, i+0.2)
        mp = mp.union(s.boundary)
    
    res['features'].append({'type':'Feature',
                            'geometry':mapping(mp)})

print("\n\n\n")
print(json.dumps(res))

with open("quartierHopital_interpolate.geojson", "w") as wfile :
    json.dump(res, wfile)