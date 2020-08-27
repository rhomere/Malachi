var map;
function loadleafletMap() {
    //-------------
    //- Create Map -
    //-------------
    // Create a map in the div #map
    map = L.map('map', { zoomControl: false });

    map.on('load', function (e) {
        map.invalidateSize();
    });

    // Setup Base Tiles
    var baseTileLayer = {
        Streets: ['jayroc4.178fe99d', 'pk.eyJ1IjoiamF5cm9jNCIsImEiOiJ5Q3cyRUhZIn0.q-UvOUBA4hJAYfS546JxEA'],
        Satellite: ['msivri.leb0of7n', 'pk.eyJ1IjoibXNpdnJpIiwiYSI6ImFHT0g4ZEUifQ.lcYsOyJarFo07Qt5qzpCiQ'],
        StreetsClassic: ['msivri.leb10d5n', 'pk.eyJ1IjoibXNpdnJpIiwiYSI6ImFHT0g4ZEUifQ.lcYsOyJarFo07Qt5qzpCiQ']
    }
    // create a tile layer sourced from mapbox
    var currentTileLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/' + baseTileLayer.Streets[0] + '/{z}/{x}/{y}.png?access_token=' + baseTileLayer.Streets[1]).addTo(map);

    map.setView([27, -82], 5);

    //-------------
    //- Shape Layer Options -
    //-------------
    var shapeOptions = {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                    if (k === '__color__') {
                        return;
                    }
                    return k + ": " + feature.properties[k];
                }).join("<br />"), {
                    maxHeight: 200
                });
            }
        },
        style: function (feature) {
            return {
                opacity: 1,
                fillOpacity: 0.7,
                radius: 6,
                color: feature.properties.__color__
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                opacity: 1,
                fillOpacity: 0.7,
                color: feature.properties.__color__
            });
        }
    };
}