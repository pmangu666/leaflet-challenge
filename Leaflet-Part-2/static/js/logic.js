// Initialize the map
var map = L.map('map').setView([37.7749, -122.4194], 5);

// Define base maps using OpenStreetMap and CartoDB
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});

var osmTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors, © OpenTopoMap'
});

// Humanitarian OpenStreetMap Team (HOT)
var osmHot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

// CartoDB Dark Matter
var cartoDarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors, © CartoDB'
});

// Add street map as the default base layer
streetMap.addTo(map);

// Define the layer for earthquakes
var earthquakes = L.layerGroup();

// Fetch GeoJSON data for earthquakes
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
  .then(response => response.json())
  .then(data => {
      console.log("Earthquake data fetched:", data);

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

      // Add GeoJSON layer to the earthquakes layer group
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
      }).addTo(earthquakes);

      earthquakes.addTo(map);

      // Create legend
      var legend = L.control({ position: 'bottomright' });

      legend.onAdd = function (map) {
          var div = L.DomUtil.create('div', 'legend');
          var depths = [0, 10, 30, 50, 70, 90];

          div.innerHTML += '<strong>Depth (km)</strong><br>';
          for (var i = 0; i < depths.length; i++) {
              div.innerHTML +=
                  '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
                  depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
          }

          return div;
      };

      legend.addTo(map);
  })
  .catch(error => {
      console.log('Error fetching earthquake data:', error);
  });

// Define the layer for tectonic plates
var tectonicPlates = L.layerGroup();

// Fetch GeoJSON data for tectonic plates
fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
  .then(response => response.json())
  .then(data => {
      console.log("Tectonic plates data fetched:", data);

      // Add GeoJSON layer to the tectonic plates layer group
      L.geoJson(data, {
          style: {
              color: '#ff7800',
              weight: 2
          }
      }).addTo(tectonicPlates);

      tectonicPlates.addTo(map);
  })
  .catch(error => {
      console.log('Error fetching tectonic plates data:', error);
  });

// Define base maps and overlay maps
var baseMaps = {
    "Street Map": streetMap,
    "Topographic Map": osmTopoMap,
    "OSM Hot": osmHot,
    "CartoDB Dark Matter": cartoDarkMatter
};

var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer controls to the map
L.control.layers(baseMaps, overlayMaps).addTo(map);
