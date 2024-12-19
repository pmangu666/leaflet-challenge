// Initialize the map
var map = L.map('map').setView([37.7749, -122.4194], 5);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch GeoJSON data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(response => response.json())
    .then(data => {
        // Define a function to determine marker size
        function markerSize(magnitude) {
            return magnitude * 4;
        }

        // Define a function to determine marker color
        function markerColor(depth) {
            return depth > 90 ? '#d73027' :
                   depth > 70 ? '#fc8d59' :
                   depth > 50 ? '#fee08b' :
                   depth > 30 ? '#d9ef8b' :
                   depth > 10 ? '#91cf60' :
                                '#1a9850';
        }

        // Add GeoJSON layer to the map
        L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: markerSize(feature.properties.mag),
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                                 <p>Magnitude: ${feature.properties.mag}</p>
                                 <p>Depth: ${feature.geometry.coordinates[2]}</p>
                                 <p>${new Date(feature.properties.time)}</p>`);
            }
        }).addTo(map);

        // Create a legend
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'legend');
            var depths = [0, 10, 30, 50, 70, 90];
            var labels = [];

            // for (var i = 0; i < depths.length; i++) {
                // div.innerHTML +=
                    // '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
                    // depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
            div.innerHTML += '<strong>Depth (km)</strong><br>'; 
            for (var i = 0; i < depths.length; i++) { 
                div.innerHTML += 
                    '<i style="background:' + markerColor(
                    depths[i] + 1) + '"></i> ' + depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.log(error));
