// Import des modules
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import Tile from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Proj from 'ol/proj.js';


// On crée la map
const map = new Map({
    target: "map",

    // Couches
    layers: [
        new Tile({
            source: new OSM(),
        }),
    ],

    // Paramètres de la vue
    view: new View({
        center: Proj.transform(
            [6.6, 46.6],
            "EPSG:4326",
            "EPSG:3857"
        ),
        zoom: 10
    })
});