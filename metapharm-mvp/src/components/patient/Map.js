'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Icône personnalisée pour éviter les bugs
const iconPharma = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Icône pour la position de l'utilisateur (Un point bleu par exemple)
const iconUser = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Image simple de localisation
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

// --- COMPOSANT MAGIQUE ---
// Ce composant permet de déplacer la caméra de la carte quand la position change
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14); // Animation fluide vers la position
    }
  }, [lat, lng, map]);
  return null;
}

export default function Map({ pharmacies, userLocation }) {
  // Centre par défaut (Cotonou)
  const defaultCenter = [6.3654, 2.4183]

  return (
    <MapContainer center={defaultCenter} zoom={13} className="h-[50vh] w-full z-0">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Si on a la position de l'utilisateur, on recentre et on affiche un marqueur */}
      {userLocation && (
        <>
          <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={iconUser}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        </>
      )}

      {/* Les Pharmacies */}
      {pharmacies.map((pharma) => (
        <Marker key={pharma.id} position={[pharma.lat, pharma.lng]} icon={iconPharma}>
          <Popup>
            <b className="text-green-700">{pharma.name}</b> <br />
            {pharma.is_on_duty ? "🟢 De Garde" : "🔴 Fermé"} <br/>
            {pharma.stock_info && <span className="text-xs font-bold text-blue-600">📦 {pharma.stock_info}</span>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}