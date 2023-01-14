//--------------------------------------------------- Définition des variables 
let url = $('#server-url').val();
url = 'http://localhost:8000';

// Cartes
const osm = new ol.layer.Tile({
  source: new ol.source.OSM(),
});


// route - Linestring
const route001 = new ol.geom.LineString([
  [46.7727046,6.6494449],
  [46.7728096,6.6493539],
  [46.7728946,6.6492831],
  [46.7730006,6.6492489]
]);

// Poyligne
/*
const route_polyligne = new ol.format.Polyligne().writeGeometry(route001);

const feature_route = new ol.Feature(route_polyligne);

const source = new ol.layer.Vector();
source.addFeature(feature_route);
map.addLayer(source);
*/

const route = new ol.layer.Vector({
  id: 'Route001',
  source: new ol.source.Vector({
    features:[
      new ol.Feature({
        geometry: new ol.geom.LineString(
          [
            [46.7727046,6.6494449],
            [46.7728096,6.6493539],
            [46.7728946,6.6492831],
            [46.7730006,6.6492489]
          ]
        ),
      })
    ]
  }),
});



const geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857',
    },
  },
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [6.6494449,46.7727046],
            [6.6493539,46.7728096],
            [6.6492831,46.7728946],
            [6.6492489,46.7730006]
          ],
        ],
      },
    },
  ],
};
const route_srouce = new ol.source.Vector({
  features: new ol.format.GeoJSON().readFeatures(geojsonObject),
});

const styles = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'blue',
    width: 3,
  }),
  fill: new ol.style.Fill({
    color: 'rgba(0, 0, 255, 0.1)',
  }),
})

const layer = new ol.layer.Vector({
  source: route_srouce,
  style: styles,
});


// Création de la carte
const map = new ol.Map({
  target: "map",
  layers: [
    layer,
    osm
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([6.64651, 46.77167]),
    zoom: 16,
  }),
});

console.log("Map chargé")



// geometry des routes (source : shp)
let geometryRoad;


//--------------------------------------------------- Fonctions

function getData() {
  /*
  // Fonction qui fait la requête sur la BD
  console.log("Tentative de connexion : ", url)
  $.ajax({
    dataType: "json",
    url,
    type: 'GET',
    success: function(dataFromServer) {
      //console.log('Réponse :', dataFromServer);
      updateDataServeur(dataFromServer);
      }
  });
  */
 console.log("Bonjour")


}

function updateDataServeur(data) {
  console.log('Data :', data);
  road = data.coordinates;
  geometryRoad = data;
  console.log(geometryRoad)
}


function startAnimation() {
  /* Fonction :
      - appelée quand on clique sur le bouton
      - permet de déplacer le symbol sur la route
  */
  /*
  animating = true;
  lastTime = Date.now();
  vectorLayer.on('postrender', moveFeature);
  geoMarker.setGeometry(null);
  */
}


function moveFeature(event) {
  /* Fonction :
      - appelée quand ...
      - ...
  */

  const speed = 15;
  const time = 50;
  const elapsedTime = time - lastTime;
  distance = (distance + (speed * elapsedTime) / 1e6) % 2;
  lastTime = time;

  const currentCoordinate = route.getCoordinateAt(
    distance > 1 ? 2 - distance : distance
  );
  position.setCoordinates(currentCoordinate);
  const vectorContext = ol.render.getVectorContext(event);
  vectorContext.setStyle(styles.geoMarker);
  vectorContext.drawGeometry(position);
  // tell OpenLayers to continue the postrender animation
  map.render();
};

/* https://openlayers.org/en/latest/examples/feature-move-animation.html*/

/* ---------------------------------------------------------------------- CARTE ET OPENLAYERS ------------------------------------------------*/





//--------------------------------------------------- Script principal
/*
window.onload = function() {

  initData();
  getData();
};*/

















/*--------------------------------------------------- REFERENCES 
- https://www.techiedelight.com/run-javascript-code-on-page-load/








*/