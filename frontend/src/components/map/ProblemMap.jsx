import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { TASHKENT_CENTER, MARKER_COLORS, CATEGORIES, STATUSES } from '../../utils/constants'
import useProblemsStore from '../../store/problemsStore'

const { BaseLayer } = LayersControl

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Foydalanuvchi joylashuvi uchun maxsus icon
const myLocationIcon = L.divIcon({
  html: `<div style="
    width:20px;height:20px;
    background:#3b82f6;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(59,130,246,0.3);
  "></div>`,
  className: '',
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
})

const createCustomIcon = (category, status) => {
  const color   = MARKER_COLORS[category] || MARKER_COLORS.other
  const opacity = status === 'resolved' ? 0.5 : 1
  const size    = status === 'new' ? 36 : 30
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="14" fill="${color}" opacity="${opacity}" />
    <circle cx="18" cy="18" r="10" fill="white" opacity="0.25" />
    <circle cx="18" cy="18" r="5"  fill="white" opacity="${opacity}" />
    ${status === 'new' ? `<circle cx="18" cy="18" r="14" fill="none" stroke="${color}" stroke-width="2" opacity="0.4">
      <animate attributeName="r" from="14" to="22" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
    </circle>` : ''}
  </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -(size/2)] })
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => { if (target) map.flyTo(target, 16, { duration: 1.2 }) }, [target, map])
  return null
}

function MapClickHandler({ onMapClick }) {
  const map = useMap()
  useEffect(() => {
    if (!onMapClick) return
    const handler = (e) => onMapClick(e.latlng)
    map.on('click', handler)
    map.getContainer().style.cursor = 'crosshair'
    return () => { map.off('click', handler); map.getContainer().style.cursor = '' }
  }, [map, onMapClick])
  return null
}

// Men turgan joy tugmasi
function LocateMe() {
  const map = useMap()

   useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.5 })
      },
      () => {}
    )
  }, [])


  const locate = () => {
    if (!navigator.geolocation) {
      alert("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo([latitude, longitude], 16, { duration: 1.5 })
      },
      () => alert("Joylashuvni aniqlab bo'lmadi. Ruxsat bering.")
    )
  }

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: 80 }}> 
    {/* <div className="leaflet-top leaflet-left" style={{ marginTop: 80, zIndex: 400 }}> */}
      <div className="leaflet-control">
        <button
          onClick={locate}
          title="Men turgan joy"
          style={{
            width: 36, height: 36,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: '#3b82f6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          📍
        </button>
      </div>
    </div>
  )
}

function Markers() {
  const { problems } = useProblemsStore()
  const navigate     = useNavigate()
  return problems.map(problem => (
    <Marker
      key={problem.id}
      position={[problem.latitude, problem.longitude]}
      icon={createCustomIcon(problem.category, problem.status)}
    >
      <Popup maxWidth={260}>
        <div style={{ minWidth: 200 }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ background: `${MARKER_COLORS[problem.category]}30`, color: MARKER_COLORS[problem.category], padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {CATEGORIES[problem.category]?.emoji} {CATEGORIES[problem.category]?.label || 'Other'}
            </span>
          </div>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: '#f1f5f9' }}>{problem.title}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{problem.description?.slice(0, 80)}...</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>👍 {problem.vote_count || 0}</span>
            <button
              onClick={() => navigate(`/problems/${problem.id}`)}
              style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Batafsil →
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  ))
}

export default function ProblemMap({ flyTo, onMapClick, clickMode = false }) {
  return (
    <MapContainer
      center={TASHKENT_CENTER}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="🗺️ Ko'cha xaritasi">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={19}
          />
        </BaseLayer>
        <BaseLayer name="🛰️ Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri, Maxar'
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

      <LocateMe />
      {flyTo     && <FlyTo target={flyTo} />}
      {clickMode && <MapClickHandler onMapClick={onMapClick} />}
      <Markers />
    </MapContainer>
  )
}
