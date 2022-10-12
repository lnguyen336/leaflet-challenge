// Store API endpoint as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform GET request to queryURL
d3.json(queryURL).then(function(data) {
    // Once a response is received, it will lead to data.features and data.features object to createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData, platesData) {
    // Give each feature a pop-up, describing the place and time of the earthquake(s)
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Create GeoJSON layer, containing features array on the earthquakeData object
    function createCircleMarker(feature, latlng){
        let options = {
         radius:feature.properties.mag*5,
         fillColor: chooseColor(feature.properties.mag),
         color: chooseColor(feature.properties.mag),
         weight: 1,
         opacity: 0.8,
         fillOpacity: 0.35
        } 
        return L.circleMarker(latlng,options);
     }

     // Create variable for earthquakes to house the variable latlng, each feature for pop-up, and circle/radius/color/weight/opacity
     let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
     });

     // Send earthquakes layer to createMap function, which begins creating map while adding features
     createMap(earthquakes);
}

// Circles color palette based on map (feature) data marker
function chooseColor(mag) {
    switch(true) {
        case(1.0 <= mag && mag <= 2.5):
            return "#7CFC00";
        case (2.5 <= mag && mag <=4.0):
            return "#AAFF00";
        case (4.0 <= mag && mag <=5.5):
            return "#FFFF00";
        case (5.5 <= mag && mag <= 8.0):
            return "#FFA500";
        case (8.0 <= mag && mag <=20.0):
            return "#FF0000";
        default:
            return "#E2FFAE";
    }
}

// Create map legend for context of map data
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [1.0, 2.5, 4.0, 5.5, 8.0];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    // Go through each magnitude item to label and color legend
    
    // Push to labels array as list item
    for (var i = 0; i < grades.length; i++) {
        labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
    }

    // Add each label list item to the div under the <u1> tag
    div.innerHTML += "<u1>" + labels.join("") + "</u1>";

    return div;
};

function createMap(earthquakes) {
    // Define outdoors and graymap layers
    let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 20,
     id: "outdoors-v11",
     accessToken: API_KEY
   })
 
   let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 20,
     id: "light-v10",
     accessToken: API_KEY
   });
 
   // Define a baseMaps object to hold our base layers
   let baseMaps = {
     "Outdoors": streetstylemap,
     "Grayscale": graymap
   };
 
   // Create overlay object to hold our overlay layer
   let overlayMaps = {
     Earthquakes: earthquakes
   };
 
   // Create our map, giving it the streetmap and earthquakes layers to display on load
   let myMap = L.map("map", {
     center: [
       39.8282, -98.5795
     ],
     zoom: 4,
     layers: [streetstylemap, earthquakes]
   });
   // Add the layer control to the map
   L.control.layers(baseMaps, overlayMaps, {
     collapsed: false
   }).addTo(myMap);
   legend.addTo(myMap);
 }