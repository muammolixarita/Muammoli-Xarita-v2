import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import { TASHKENT_CENTER } from '../../utils/constants'

const { BaseLayer } = LayersControl

const pinIcon = L.divIcon({
  html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#22c55e"/>
    <circle cx="16" cy="16" r="7" fill="white"/>
    <circle cx="16" cy="16" r="4" fill="#22c55e"/>
  </svg>`,
  className:  '',
  iconSize:   [32, 40],
  iconAnchor: [16, 40],
})

const myLocationIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;
    background:#3b82f6;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(59,130,246,0.3);
  "></div>`,
  className:  '',
  iconSize:   [16, 16],
  iconAnchor: [8, 8],
})

function ClickHandler({ onSelect }) {
  useMapEvents({ click: (e) => onSelect(e.latlng) })
  return null
}

// Men turgan joy tugmasi + avtomatik joy aniqlash
function LocateMe({ onLocate }) {
  const map = useMap()

  const locate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        map.flyTo([latlng.lat, latlng.lng], 17, { duration: 1.2 })
        onLocate(latlng)
      },
      () => {}
    )
  }

  // Sahifa ochilganda avtomatik joy aniqlash
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        map.flyTo([latlng.lat, latlng.lng], 16, { duration: 1.5 })
      },
      () => {}
    )
  }, [])

  return (
    // <div className="leaflet-bottom leaflet-right" style={{ marginBottom: 30, marginRight: 10 }}>  eski
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: 10, marginRight: 10, zIndex: 400 }}>
      <div className="leaflet-control">
        <button
          onClick={locate}
          title="Mening joylashuvim"
          style={{
            width: 40, height: 40,
            background: '#1e293b',
            border: '2px solid #3b82f6',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 2px 12px rgba(59,130,246,0.4)',
          }}
        >
          📍
        </button>
      </div>
    </div>
  )
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? [value.lat, value.lng] : null
  )

  const handleSelect = (latlng) => {
    setPosition([latlng.lat, latlng.lng])
    onChange({ lat: latlng.lat, lng: latlng.lng })
  }

  return (
    <div className="relative">
      <div className="w-full rounded-xl overflow-hidden border border-surface-700 focus-within:border-brand-500 transition-colors" style={{ height: 280 }}>
        <MapContainer
          center={position || TASHKENT_CENTER}
          zoom={position ? 15 : 13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="🗺️ Ko'cha">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
                maxZoom={19}
              />
            </BaseLayer>
            <BaseLayer name="🛰️ Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
                maxZoom={19}
              />
            </BaseLayer>
            <BaseLayer name="⛰️ Relyef">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
                maxZoom={19}
              />
            </BaseLayer>
          </LayersControl>

          <ClickHandler onSelect={handleSelect} />
          <LocateMe onLocate={handleSelect} />

          {position && (
            <Marker position={position} icon={pinIcon} />
          )}
        </MapContainer>
      </div>

      {!position && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none" style={{ zIndex: 500 }}>
          <div className="bg-surface-900/90 backdrop-blur border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-300 flex items-center gap-2">
            <span>📍</span> Xaritada muammo joyini bosing yoki 📍 tugmasini bosing
          </div>
        </div>
      )}

      {position && (
        <div className="mt-2 text-xs text-surface-400 font-mono flex items-center gap-2">
          <span className="text-brand-400">✓ Joylashuv tanlandi:</span>
          <span>{position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
        </div>
      )}
    </div>
  )
}
