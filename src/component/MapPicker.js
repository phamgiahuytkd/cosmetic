// components/MapPicker.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon not showing bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationMarker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const MapPicker = ({ center, onSelect }) => {
  return (
    <div style={{ height: "300px", width: "100%", marginTop: "1rem" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={onSelect} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
