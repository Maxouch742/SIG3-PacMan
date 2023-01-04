////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Définition projection CH1903/MN95
proj4.defs(
  "EPSG:2056",
  "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1"
  + " +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
);
// ensuite, on doit dire à OpenLayers que notre proj4 est ok:
ol.proj.proj4.register(proj4);


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fond de carte
const osm = new ol.layer.Tile({
  source: new ol.source.OSM(),
  opacity:0.75,
});

// Points sur les routes
const pts_shp = new ol.layer.Vector({
  source: new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: 'quartierHopital_MN95_interpolate.geojson'
  }),
});

const style = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 1000,
    fill: new ol.style.Fill({
      color: '#ffcc33'
    })
  })
});
pts_shp.setStyle(style);
  


// Création de la carte
const map = new ol.Map({
  target: "map",
  layers: [
    osm,
    pts_shp
  ],
  view: new ol.View({
    projection: 'EPSG:2056',
    center: [2539492.7, 1180567.1],
    zoom: 18,
  }),
});

