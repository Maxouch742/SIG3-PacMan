// Définition des variables 
let url = $('#server-url').val();
url = 'http://localhost:8000';

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
  console.log("Coord. : ", road);


  /*
  // Création d'une source vectorielle avec le GeoSJON
  const source_road = new ol.source.Vector({
    format: ol.format.GeoJSON(),
    url: data
  });
  // Création de la couche
  const road = new ol.layer.Vector({
    source: source_road
  })*/

  /*const source_layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: new ol.format.GeoJSON().readFeature(data),
    })
  });

  // Ajout à la carte
  map.addLayer(source_layer);

  var path;
  source.once('change',function(e){
    if (source.getState() === 'ready') {
      path = source.getFeatures()[0];
    }
  });

  console.log(source_layer);
  console.log(source_road.getFeatures()[0]);*/
};