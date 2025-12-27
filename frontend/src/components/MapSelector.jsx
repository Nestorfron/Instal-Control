import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RecenterButton from "./RecenterButton";

// Fix icon de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Distancia en metros entre dos coordenadas
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Componente que centra el mapa automáticamente cuando cambia position
function AutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [map, position]);
  return null;
}

export default function MapSelector({ position, setPosition, clientes = [] }) {
  const defaultPos = [-34.9011, -56.1645]; // Montevideo por defecto
  const [alertNear, setAlertNear] = useState(null);

  // Revisar si estamos cerca de algún cliente existente
  useEffect(() => {
    if (!position) return;
    const nearby = clientes.find((c) => {
      if (!c.lat || !c.lng) return false;
      const d = getDistance(position[0], position[1], Number(c.lat), Number(c.lng));
      return d < 50; // menos de 50 metros
    });
    setAlertNear(nearby || null);
  }, [position, clientes]);

  // Componente para capturar clicks en el mapa
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return position ? <Marker position={position}></Marker> : null;
  }

  return (
    <div className="relative">
      {/* Alerta de proximidad */}
      {alertNear && (
        <div className="absolute top-2 left-2 z-50 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 p-2 rounded shadow">
          ⚠ Estás cerca de: {alertNear.nombre}
        </div>
      )}

      <MapContainer
        center={position || defaultPos}
        zoom={14}
        className="h-64 w-full rounded-2xl mb-4"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores de clientes existentes */}
        {clientes.map((c) => (
          <Marker key={c.id} position={[Number(c.lat), Number(c.lng)]}>
            <Popup>
              <strong>{c.nombre}</strong>
              <br />
              {c.direccion}
            </Popup>
          </Marker>
        ))}

        {/* Marcador de posición seleccionada */}
        {position && <Marker position={position}></Marker>}

        <LocationMarker />

        {/* Auto centrar mapa al cargar o cambiar position */}
        <AutoCenter position={position} />

        {/* Botón Recenter */}
        <RecenterButton position={position} />
      </MapContainer>
    </div>
  );
}
