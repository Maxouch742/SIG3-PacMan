let url = $('#server-url').val();
url = 'http://localhost:8000';



////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Définition projection CH1903/MN95
////////////////////////////////////////////////////////////////////////////////////////////////////////////
proj4.defs(
  "EPSG:2056",
  "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1"
  + " +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
);
// ensuite, on doit dire à OpenLayers que notre proj4 est ok:
ol.proj.proj4.register(proj4);


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fond de carte et map
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fond de carte OSM
const osm = new ol.layer.Tile({
  source: new ol.source.OSM(),
  opacity:0.7,
});

// Création de la carte
const map = new ol.Map({
  target: "map",
  layers: [osm],
  view: new ol.View({
    projection: 'EPSG:2056',
    center: [2539492.7, 1180567.1],
    zoom: 16,
  }),
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Variables globales pour le jeu
////////////////////////////////////////////////////////////////////////////////////////////////////////////

let vectorLayer;
let route_poly;
let route_feat;
let position;
let geoMarker;

// Style
const styles = {
  'route': new ol.style.Style({
    stroke: new ol.style.Stroke({
      width: 6,
      color: [237, 212, 0, 0.8],
    }),
  }),
  'geoMarker': new ol.style.Style({
    image: new ol.style.Icon({
      src: 'picture/pacman_carte.png',
      scale: 0.04,
      rotation: 0,
    }),
  }),
}

const speedInput = 200;
let animating = false;
let distance = 0;
let lastTime;
let lastPos = false;


function startGame() {
  // Permet de changer l'image pour montrer qu'il ne reste que 2 vies
  document.getElementById("img-life").src="picture/pacman_lifes_2.png";

  // GET (sur la database)
  console.log('Cette page tente de joindre:', url);
  $.ajax({
    url: url,
    type: 'GET',
    success: function(dataFromServer) {
      route_coord = dataFromServer['coordinates']
      affichRoad(route_coord);
    },
    error: function(request, status, error) { 
      console.log("Error: " + error)
    }
  });
};


function affichRoad(data){
  

  // Creation du feature route
  route_poly = new ol.geom.LineString(data);
  route_feat = new ol.Feature({
    geometry: route_poly,
    type: 'route'
  });
  const route_sour = new ol.source.Vector();
  route_sour.addFeature(route_feat);

  // Couches supplementaires
  const startMarker = new ol.Feature({
    type: 'icon',
    geometry: new ol.geom.Point(route_poly.getFirstCoordinate()),
  });
  const endMarker = new ol.Feature({
    type: 'icon',
    geometry: new ol.geom.Point(route_poly.getLastCoordinate()),
  });
  position = startMarker.getGeometry().clone();
  geoMarker = new ol.Feature({
    type: 'geoMarker',
    geometry: position,
  });
  // création de la couche finale
  vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [route_feat, geoMarker, startMarker, endMarker],
    }),
    style: function(feature) {
      return styles[feature.get('type')];
    }
  });
  map.addLayer(vectorLayer);

  // Paramètres de la fenêtre d'affiche de la map
  map.getView().setCenter(route_poly.getFirstCoordinate());
  map.getView().setZoom(18);

  animating = true;
  lastTime = Date.now();
  vectorLayer.on('postrender', moveFeature);
  //geoMarker.setGeometry(null);
};


function moveFeature(event) {
  const speed = speedInput;
  const time = event.frameState.time;
  const elapsedTime = time - lastTime;
  distance = (distance + (speed * elapsedTime) / 1e6) % 2;
  lastTime = time;

  // Calcul de la nouvelle position du pacman
  const currentCoordinate = route_poly.getCoordinateAt(
    distance > 1 ? 2 - distance : distance 
  );
  position.setCoordinates(currentCoordinate);
  
  // Calcul de la rotation de l'icône
  


  if (currentCoordinate == route_coord[route_coord.length-1]) {
    console.log("TOP");
  }
  
  // Mise à jour de la carte
  const vectorContext = ol.render.getVectorContext(event);
  vectorContext.setStyle(styles.geoMarker);
  vectorContext.drawGeometry(position);
  map.render();
  map.getView().setCenter(currentCoordinate);
};



/* TODO :
  - Rotation image
  - layers points avec suppression quand passage de Pacman et ajout points


*/