SELECT gid, osm_id, code, fclass, name, ref, oneway, maxspeed, layer, bridge, tunnel, ST_AsText(geom)
FROM gis_osm_roads_free_1;