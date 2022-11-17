const map = new ol.Map({
    target: "map", // la cible où l'on veut charger la Map

    // Couches
    layers: [
      new ol.layer.Tile({
        // une source particulière, OSM à ne pas utiliser en production!
        source: new ol.source.OSM(),
      }),
    ],

    // Vue (contrôle l'échelle, le centre, etc..)
    view: new ol.View({
      center: ol.proj.fromLonLat([6.63, 46.783]),
      zoom: 15,
    }),
  });