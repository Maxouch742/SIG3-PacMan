// Définition des variables 
let url = $('#server-url').val();
url = 'http://localhost:8000';

getData();

// Fonction pour faire la requête de la premiere route
function getData() {
  console.log("Tentative de connexion : ", url)
  $.ajax({
    dataType: "json",
    url,
    type: 'GET',
    success: function(dataFromServer) {
      console.log('Réponse :', dataFromServer);
      updateDataServeur(dataFromServer);

  
          //$('#data-get').text(
          //    JSON.stringify(dataFromServer, undefined, 2)
          //);
      }
  });
}

/* https://openlayers.org/en/latest/examples/feature-move-animation.html*/

/* ---------------------------------------------------------------------- CARTE ET OPENLAYERS ------------------------------------------------*/
// Layers
const osm = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

// Création de la carte
const map = new ol.Map({
  target: "map", // la cible où l'on veut charger la Map

  // Couches
  layers: [
    osm
  ],

  // Vue (contrôle l'échelle, le centre, etc..)
  view: new ol.View({
    center: ol.proj.fromLonLat([6.64651, 46.77167]),
    zoom: 16,
  }),
});

function updateDataServeur(dataServer) {
  console.log('Data :', dataServer);
  road = dataServer.coordinates;

  const route = new ol.format.Polyline({
    factor: 1e6,
  }).readGeometry(road);

  const routeFeature = new ol.Feature({
    type: 'route',
    geometry: route,
  });
  const startMarker = new ol.Feature({
    type: 'icon',
    geometry: new ol.geom.Point(route.getFirstCoordinate()),
  });
  const endMarker = new ol.Feature({
    type: 'icon',
    geometry: new ol.geom.Point(route.getLastCoordinate()),
  });
  const position = startMarker.getGeometry().clone();
  const geoMarker = new ol.Feature({
    type: 'geoMarker',
    geometry: position,
  });

  const styles = {
    'route': new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 6,
        color: [237, 212, 0, 0.8],
      }),
    }),
    'icon': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: 'picture/icon.png',
      }),
    }),
    'geoMarker': new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({color: 'black'}),
        stroke: new ol.style.Stroke({
          color: 'white',
          width: 2,
        }),
      }),
    }),
  };

  const vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [routeFeature, geoMarker, startMarker, endMarker],
    }),
    style: function (feature) {
      return styles[feature.get('type')];
    },
  });

  map.addLayer(vectorLayer);

  console.log("ok");

  let distance = 0;
  let lastTime;
  let animating = false;

  function moveFeature(event) {
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

  function startAnimation() {
    animating = true;
    lastTime = Date.now();
    vectorLayer.on('postrender', moveFeature);
    // hide geoMarker and trigger map render through change event
    geoMarker.setGeometry(null);
  }

  startAnimation();
};