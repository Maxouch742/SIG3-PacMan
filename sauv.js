
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Polyligne route
const route_coord = [
  [2539492.7402868, 1180567.101155836],
  [2539492.8357670126, 1180566.8517170758],
  [2539494.1380094127, 1180563.4477505488],
  [2539500.2995065134, 1180547.3430828892],
  [2539509.9360880796, 1180522.1426338975],
  [2539521.358872784, 1180492.2882048136],
  [2539524.052714964, 1180485.24591781],
  [2539526.4044553135, 1180479.1187138006]
];
const route_poly = new ol.geom.LineString(route_coord);
const route_feat = new ol.Feature({
  geometry: route_poly,
  type: 'route'
});
const route_sour = new ol.source.Vector();
route_sour.addFeature(route_feat);

console.log("Création feature")

// Couches supplementaires
const startMarker = new ol.Feature({
  type: 'icon',
  geometry: new ol.geom.Point(route_poly.getFirstCoordinate()),
});
const endMarker = new ol.Feature({
  type: 'icon',
  geometry: new ol.geom.Point(route_poly.getLastCoordinate()),
});
const position = startMarker.getGeometry().clone();
const geoMarker = new ol.Feature({
  type: 'geoMarker',
  geometry: position,
});

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
console.log("Création style");


/////////////////////////////////////////////
// création de la couche finale
const vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: [route_feat, geoMarker, startMarker, endMarker],
  }),
  style: function(feature) {
    return styles[feature.get('type')];
  }
});
map.addLayer(vectorLayer);
console.log("Upload carte to map");


////////////////////////////////////////////
// Debut du jeu
const speedInput = 1000;
let animating = false;
let distance = 0;
let lastTime;
let lastPos = false;
let currentCoordinate;

// 
function moveFeature(event) {
  const speed = speedInput;
  const time = event.frameState.time;  // Temps posix (https://www.epochconverter.com)
  const elapsedTime = time - lastTime;
  distance = (distance + (speed * elapsedTime) / 1e6) % 2;
  lastTime = time;

  
  if (distance <= 1) {
    // Calcul de la nouvelle position du pacman
    currentCoordinate = route_poly.getCoordinateAt(distance);
    position.setCoordinates(currentCoordinate);
  } else {
    stopAnimation();
  }
  
  // Calcul de la rotation de l'icône
  /*if (lastPos !== false) {
    const dposi_x = currentCoordinate[0] - lastPos[0];
    const dposi_y = currentCoordinate[0] - lastPos[1];
    const angle = Math.tan( dposi_y/dposi_x );

    styles.geoMarker.getImage().setRotation(angle);
  }*/

  lastPos = currentCoordinate;

  if (currentCoordinate == route_coord[route_coord.length-1]) {
    console.log("TOP");
  }
  
  // Mise à jour de la carte
  const vectorContext = ol.render.getVectorContext(event);
  vectorContext.setStyle(styles.geoMarker);
  vectorContext.drawGeometry(position);
  map.render();
  map.getView().setCenter(currentCoordinate);
}

function startGame() {

  // Permet de changer l'image pour montrer qu'il ne reste que 2 vies
  document.getElementById("img-life").src="picture/pacman_lifes_2.png";

  animating = true;
  lastTime = Date.now();
  vectorLayer.on('postrender', moveFeature);
  geoMarker.setGeometry(null);
}

function stopAnimation() {
  // Arrêt de l'animation, fixation de la position de l'icone
  animating = false;
  geoMarker.setGeometry(position);
  vectorLayer.un('postrender', moveFeature);

  // Attente du choix de l'utilisateur
  document.addEventListener('keydown', (event) => {
    const name = event.key;

    moveNext(name);
  }, true);
}


function moveNext(direction){
  console.log(direction);
  console.log("BOnjour");
}
// TODO :
// - Rotation image
// - layers points avec suppression quand passage de Pacman et ajout points
// - https://openlayers.org/en/latest/examples/animated-gif.html (utilisation GIF)