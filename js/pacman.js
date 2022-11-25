// Layers
const osm = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const map = new ol.Map({
  target: "map", // la cible où l'on veut charger la Map

  // Couches
  layers: [
    osm
  ],

  // Vue (contrôle l'échelle, le centre, etc..)
  view: new ol.View({
    center: ol.proj.fromLonLat([6.64, 46.77]),
    zoom: 15,
  }),
});


