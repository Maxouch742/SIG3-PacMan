

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
var imageStyle = new ol.style.Style({
  image: new ol.style.Circle({
        radius: 5,
        snapToPixel: false,
        fill: new ol.style.Fill({
        color: [255 , 0 , 0 , 0.2]
    }),
    stroke: new ol.style.Stroke({
        color: [255 , 0 , 0 , 1],
        width: 1
    })
})
});
/*
const LayerPoint = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: [
      new ol.Feature({
        geometry: new ol.geom.MultiPoint([
          [2539708, 1180462],
          [2539710, 1180471]
        ])
      })
    ]
  }),
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: [255, 0, 0]
      })
    })
  })
});
*/

const geojson_object = {
  "type": "Feature", 
  "geometry": {
    "type": "MultiPoint",
    "coordinates": [
      [2539708.9123432883, 1180462.5350835267], 
      [2539708.9973270786, 1180462.3540372471], 
      [2539710.1704982957, 1180471.8081111487], 
      [2539710.2697891463, 1180471.981723726], 
      [2539716.265685139, 1180456.5318001767], 
      [2539716.4628886976, 1180456.4984721635], 
      [2539719.9082607366, 1180475.3816695483], 
      [2539720.1058750255, 1180475.350870315], 
      [2539725.380133099, 1180459.51517883], 
      [2539725.534782237, 1180459.6420001376], 
      [2539727.0002611657, 1180469.1024249843], 
      [2539727.0600396725, 1180468.911567629], 
      [2539710.8346676333, 1180472.5092169808], 
      [2539710.9808434006, 1180472.645718428]
    ]
  }
};

/*
const geojson_VectorSource = new ol.source.Vector({
  features: [
    (new ol.format.GeoJSON()).readFeatures(geojson_object, {featureProjection: 'EPSG:2056'})
  ]
});
const geojson_vectorLayer = new ol.layer.Vector({
  source: geojson_VectorSource,
  style: new ol.style.Circle({
    radius: 5,
    fill: new ol.style.Fill({
      color: [255, 0, 0]
    })
  })
});*/


const LayerPoint = new ol.layer.Vector({
  source: new ol.source.Vector({
    projection: 'EPSG:2056',
    format: new ol.format.GeoJSON(),
    url: './mygeojson.json',
  }),
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: [255, 0, 0]
      })
    })
  })
});


console.log(LayerPoint);

/*
const pts_shp = new ol.layer.Vector({
  source: new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: 'quartierHopital_MN95_interpolate.geojson'
  }),
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 1000,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});
  */


// Création de la carte
const map = new ol.Map({
  target: "map",
  layers: [
    osm,
    LayerPoint
  ],
  view: new ol.View({
    projection: 'EPSG:2056',
    center: [2539492.7, 1180567.1],
    zoom: 18,
  }),
});




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
};


let url = $('http://localhost:8000').val();
function startGame() {
  

  console.log('Cette page tente de joindre:', url);
  $.ajax({
    url: url,
    type: 'GET',
    success: function(dataFromServer) {
      console.log('Le serveur a répondu:', dataFromServer);
      $('#data-get').text(
        JSON.stringify(dataFromServer, undefined, 2)
      );
    }
  });
}


  /*

  // Permet de changer l'image pour montrer qu'il ne reste que 2 vies
  document.getElementById("img-life").src="picture/pacman_lifes_2.png";

  animating = true;
  lastTime = Date.now();
  vectorLayer.on('postrender', moveFeature);
  geoMarker.setGeometry(null);
  */


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
  console.log("Bonjour");
}
// TODO :
// - Rotation image
// - layers points avec suppression quand passage de Pacman et ajout points
// - https://openlayers.org/en/latest/examples/animated-gif.html (utilisation GIF)