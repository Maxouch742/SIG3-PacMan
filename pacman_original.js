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
    center: [
        2539510.0,
        1180335.8],
    zoom: 16,
  }),
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Variables globales pour le jeu
////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


// Variables globales
let vectorLayer;
let route_poly;
let route_feat;
let position;
let geoMarker;
speedInput = 200;


// Variables globales utiles dans les fonctions pour bouger PacMan
animating = false;
distance = 0;
let lastTime;
lastPos = false;
let target;
let source;
let angle;


function startGame() {
  /** Fonction pour lancer le jeu,
   *  Activée lors du clic sur le bouton "START"
   */

  // Permet de changer l'image pour montrer qu'il ne reste que 2 vies
  document.getElementById("img-life").src="picture/pacman_lifes_2.png";

  // Requête sur la DB pour obtenir la première route
  data_feature = getFirstRoad();
  // Attente de la réponse
  data_feature.then(function(donnee){
    // Lancement de la fonction AffichRoad avec la géométrie de la route
    affichRoad(donnee['coordinates']);
    // On garde en mémoire la target et source de la route pour sélectionner la prochaine route
    source = donnee['source'];
    target = donnee['target'];
  });
};


async function getPointsRoads(){
  /** Fonction pour créer l'url de requête sur la DB et récupérer les routes du quartier pour afficher les ronds jaunes
   * 
   * @return {json object} json de la base de données 
   */
  const url_getPointsRoads = url + '/?points';
  return await getData(url_getPointsRoads);
};


async function getFirstRoad(){
  /** Fonction pour créer l'url de requête sur la DB
   *  Et récupérer la première route pour le jeu
   * 
   * @return {json object} json de la base de données
   */
  url_getRoadPacManFirst = url + '/?FirstRoad';
  return await getData(url_getRoadPacManFirst);
};


function affichRoad(data){
  /** Fonction pour afficher la route de parcours du PacMan 
   * 
   * @param {json} data : geometry de la route à afficher et animer
   * @return {nothing}
   */
  console.log("Création de la route");
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
  position = startMarker.getGeometry().clone();
  geoMarker = new ol.Feature({
    type: 'geoMarker',
    geometry: position,
  });
  // Création de la couche finale
  vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [route_feat, geoMarker],
    }),
    style: function(feature) {
      return styles[feature.get('type')];
    }
  });
  // Ajout de la couche à la map
  map.addLayer(vectorLayer);

  // Paramètres de la fenêtre d'affiche de la map
  map.getView().setCenter(route_poly.getFirstCoordinate());
  map.getView().setZoom(18);

  // Lancement de l'animation de Pac-Man sur la courte
  animating = true;
  lastTime = Date.now();
  lastPos = false;
  console.log("Debut de l'animation");
  vectorLayer.on('postrender', moveFeature);
};

async function moveFeature(event) {
  /** Permet de faire avancer le Pac-Man sur la route
   * @param {} event  
   */

  // Calcul de la distance entre le temps précédent et actuel
  const speed = speedInput;
  const time = event.frameState.time;
  const elapsedTime = time - lastTime;
  distance = (distance + (speed * elapsedTime) / 1e6) % 2;
  lastTime = time;

  // Si le Pac-Man n'est pas encore au bout de la route, 
  if(distance < 1){
    // On fait avancer le Pac-Man sur la route
    const currentCoordinate = route_poly.getCoordinateAt(distance);
    position.setCoordinates(currentCoordinate);

    // Calcul de la rotation de l'icone
    if (lastPos !== false){
      angle = gisement(lastPos, currentCoordinate);
      styles.geoMarker.getImage().setRotation(angle-Math.PI/2);
    };
    lastPos = currentCoordinate;
    
    // Mise à jour de la carte
    const vectorContext = ol.render.getVectorContext(event);
    vectorContext.setStyle(styles.geoMarker);
    vectorContext.drawGeometry(position);
    map.render();
    map.getView().setCenter(currentCoordinate);
  } else { 
    // Le Pac-Man est au bout de la route,
    console.log("Stop de l'animation");

    // On stoppe l'animation
    animating = false;
    distance = 0;
    lastPos = false;
    geoMarker.setGeometry(position);
    vectorLayer.un('postrender', moveFeature);
    //ol.Observable.unByKey(listener);

    // On effectue la requête pour obtenir la route suivante
    data_response = getRoadsNext(target);
    data_response.then(function(results){

      let donnee = results;
      console.log("donnee",donnee);
      
      // Si la réponse n'a pas de route
      /*if (donnee.length = 0){
        // Aucune route n'est connecté ; il faut faire demi-tour
        // TODO : il faut inverser la direction
        // arrêt de la fonction
      };
      */

      // Si la réponse ne comporte qu'une seule route
      if (donnee.length == 1){
        map.removeLayer(vectorLayer);
        console.log("Ok pour continuer a afficher une route");
        console.log(donnee[0].coordinates);
        const coord = donnee[0].coordinates;

        // Lancement de la fonction AffichRoad avec la géométrie de la route
        affichRoad(coord);
        // On garde en mémoire la target et source de la route pour sélectionner la prochaine route
        source = donnee[0].source;
        target = donnee[0].target;

      } else {
        // Calcul des gisements des routes
        for (let i=0; i<donnee.length; i++){
          const coord = donnee[i]['coordinates'];
          if (coord.length >= 2){
            const angle2 = gisement(coord[0],coord[1]);
            donnee[i].gisement = angle2;
          }
        };

        if (donnee.length == 2){
          const gis_moy = (donnee[0].gisement + donnee[1].gisement)/2;
          for (let i=0; i<donnee.length; i++){
            if (donnee[i].gisement < gis_moy){
              donnee[i].direction = 'left';
            } else {
              donnee[i].direction = 'right';
            }
          }
        };

        if (donnee.length == 3){
          console.log(donnee.sort((a,b) => a.gisement - b.gisement));
          // TODO : continue le programme pour sélectionnner une route
        };

        // en attente d'une action sur les flèches directionnelles
        document.addEventListener('keydown', (event) => {
          // appel de la fonction pour le choix de la route suivante
          roadsNext(event.key, donnee);
        }, false);
      }
    });
  }
};

function roadsNext(key, roadsNext_Network){
  console.log("DATA");
  console.log(roadsNext_Network);
  console.log(key);

  objectLength = Object.keys(roadsNext_Network).length;

  if (key == 'ArrowRight'){
    console.log('ok pour right');
    for (let i=0; i < objectLength; i++){
      console.log(roadsNext_Network[i]);
      if (roadsNext_Network[i].direction === 'right'){
        map.removeLayer(vectorLayer);
        affichRoad(roadsNext_Network[i]['coordinates']);
        target = roadsNext_Network[i]['target'];
        break;
      }
    };
  } else if (key == 'ArrowLeft'){
    console.log('ok pour left');
    for (let i=0; i < objectLength; i++){
      console.log(roadsNext_Network[i]);
      if (roadsNext_Network[i].direction === 'left'){
        map.removeLayer(vectorLayer);
        affichRoad(roadsNext_Network[i]['coordinates']);
        target = roadsNext_Network[i]['target'];
        break;
      }
    };
  } else if (key == 'ArrowUp'){
    for (let i=0; i.objectLength; i++){
      if (roadsNext_Network[i].direction === 'devant'){
        map.removeLayer(vectorLayer);
        affichRoad(roadsNext_Network[i]['coordinates']);
        target = roadsNext_Network[i]['target'];
      }
    };
  };
};

async function getRoadsNext(target_value) {
  /** Récupérer un extrait de la base de données pour afficher la prochaine route
   * @param {number} target_value Valeur de la colonne "target" pour connaître les autres routes qui commencent (colonne "source") par cette target
   * @return {object} utilisation de la fonction "getData"
   */
  const url_getRoadsNext = url + '/?road:'+String(target_value);
  return await getData(url_getRoadsNext);
};


function affichRoadPoint(data){
  /** Affichage des points que doit manger Pac-Man sur la carte
   * 
   * @param {array} data tableau des coordonnées des points à afficher
   */
  // Création du style de Layer
  const style = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 2,
      fill: new ol.style.Fill({
        color: [237, 212, 0, 0.8]
      }),
      stroke: new ol.style.Stroke({
        color: [237, 212, 0, 0.8], 
        width: 1
      }),
    })
  });

  // Source du layer créé ultérieurement
  let vectorPointsSource = new ol.source.Vector({ });

  // Parcours de la liste reçue pour ajouter chaque point à la source ("vectorPointsSource")
  for (let i=0; i < data.length; i++){
    const featurething = new ol.Feature({
      geometry: new ol.geom.Point(data[i])
    });
    vectorPointsSource.addFeature( featurething );
  };

  // Création d'un layer avec les points et le style souhaité
  const vectorPointsLayer = new ol.layer.Vector({
    source: vectorPointsSource,
    style
  });

  // Ajout de la couche des points à la map
  map.addLayer(vectorPointsLayer);
};

function getData(url) {
  /**
   * @param {object jQuery} url de la requête souhaitée
   * @return {object} réponse de la requête SQL
   */
  console.log('Cette page tente de joindre:', url);
  return $.ajax({
    url: url,
    type: 'GET',
    error: function(request, status, error) { 
      console.log("Error: " + error)
    }
  });
};


// Dès que la page est chargée, on fait la requête à la bd et on affiche les cercles jaunes
window.addEventListener('DOMContentLoaded', (event) => {
  // Requête sur la DB pour afficher les ronds jaunes (points à gagner)
  const data_complete_features = getPointsRoads();
  // Attente de la réponse & affichage de la réponse SQL
  data_complete_features.then(function(donnee){
    affichRoadPoint(donnee);
  });
});

function gisement(coordA, coordB){
  /** Calcul des gisements et modulo
   * Source : http://cours-fad-public.ensg.eu/course/view.php?id=51
   * @param {array} coordA coordonnée du point A au format [x,y]
   * @param {array} coordB coordonnée du point B au format [x,y]
   * @return {number} gisement en [gon] des coordonnées
   */
  const dposi_x = coordB[0] - coordA[0];
  const dposi_y = coordB[1] - coordA[1];
  let gisement = 2*Math.atan( dposi_x / (Math.sqrt(dposi_x*dposi_x + dposi_y*dposi_y)+dposi_y) )*200/Math.PI;
  
  if (gisement < 0){
    gisement += 400;
  };
  
  console.log(gisement);
  return gisement*Math.PI/200.0
};

function moduloAngle(angle){
  /**
   * Fonction pour moduler l'angle ()
   */
  let res = angle;
  if (res<0){
    res += Math.PI;
  };
  return res
}