import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import RecenterButton from "./RecenterButton";
import "leaflet/dist/leaflet.css";

// Fix iconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ lugares }) {
    const [position, setPosition] = useState(null);
  
    useEffect(() => {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }, []);
  
    if (!position) {
      return (
        <div className="h-64 flex items-center justify-center text-sm text-gray-500">
          Obteniendo ubicación…
        </div>
      );
    }
  
    return (
      <div className="relative">
        <MapContainer center={position} zoom={14} className="h-[60vh] md:h-80 w-full rounded-2xl">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
  
          <Marker position={position}>
            <Popup>Tu ubicación</Popup>
          </Marker>
  
          {lugares.map((lugar) => (
            <Marker key={lugar.id} position={[Number(lugar.lat), Number(lugar.lng)]}>
              <Popup>
                <div className="space-y-1">
                  <strong className="block text-sm">{lugar.nombre}</strong>
                  <span className="text-xs text-gray-600">📍 {lugar.direccion}</span>
                  <span className="text-xs">{lugar.tipo === "CASA" ? "🏠 Casa" : "🏪 Comercio"}</span>
                  {lugar.trabajosPendientes > 0 && (
                    <span className="block text-xs text-red-600">
                      🛠️ {lugar.trabajosPendientes} trabajo{lugar.trabajosPendientes > 1 ? "s" : ""} pendiente{lugar.trabajosPendientes > 1 ? "s" : ""}
                    </span>
                  )}
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`,
                        "_blank"
                      )
                    }
                    className="mt-2 w-full text-xs text-blue-600 underline"
                  >
                    Navegar
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
  
          <RecenterButton position={position} />
        </MapContainer>
      </div>
    );
  }
  