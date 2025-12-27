import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";

function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RecenterButton({ position }) {
  const map = useMap();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!position) return;

    const checkCenter = () => {
      const center = map.getCenter();
      const distancia = distanciaMetros(center.lat, center.lng, position[0], position[1]);
      setVisible(distancia > 40);
    };

    // Revisar inicialmente y cada vez que el mapa se mueva
    checkCenter();
    map.on("moveend", checkCenter);

    return () => map.off("moveend", checkCenter);
  }, [map, position]);

  if (!position || !visible) return null;

  const recenter = () => {
    map.flyTo(position, map.getZoom(), { animate: true, duration: 0.8 });
  };

  return (
    <button
      onClick={recenter}
      className="
        absolute bottom-4 right-4 z-[1000]
        h-11 w-11
        rounded-full
        bg-white dark:bg-slate-800
        border border-gray-200 dark:border-slate-700
        flex items-center justify-center
        shadow-md
        active:scale-95
        transition
      "
      title="Centrar en mi ubicación"
    >
      <LocateFixed className="h-5 w-5 text-blue-600" />
    </button>
  );
}
