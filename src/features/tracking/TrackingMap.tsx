import { useEffect, useMemo } from "react"
import {
  divIcon,
  latLngBounds,
  type LatLngTuple,
} from "leaflet"
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet"
import { ArrowRight, ExternalLink, MapPin, MapPinned } from "lucide-react"

import type { Shipment } from "@/types/shipment"
import "leaflet/dist/leaflet.css"

interface Coordinates {
  latitude: number
  longitude: number
}

interface TrackingMapProps {
  shipment: Shipment
}

interface RouteStop {
  location: string
  position: LatLngTuple
  completed: boolean
}

const CITY_COORDINATES: Record<string, Coordinates> = {
  jakarta: { latitude: -6.2088, longitude: 106.8456 },
  bandung: { latitude: -6.9175, longitude: 107.6191 },
  semarang: { latitude: -6.9667, longitude: 110.4167 },
  yogyakarta: { latitude: -7.7956, longitude: 110.3695 },
  surabaya: { latitude: -7.2575, longitude: 112.7521 },
  malang: { latitude: -7.9666, longitude: 112.6326 },
  denpasar: { latitude: -8.6705, longitude: 115.2126 },
  mataram: { latitude: -8.5833, longitude: 116.1167 },
  medan: { latitude: 3.5952, longitude: 98.6722 },
  palembang: { latitude: -2.9761, longitude: 104.7754 },
  padang: { latitude: -0.9471, longitude: 100.4172 },
  "bandar lampung": { latitude: -5.3971, longitude: 105.2668 },
  balikpapan: { latitude: -1.2379, longitude: 116.8529 },
  pontianak: { latitude: -0.0263, longitude: 109.3425 },
  banjarmasin: { latitude: -3.3186, longitude: 114.5944 },
  makassar: { latitude: -5.1477, longitude: 119.4327 },
  manado: { latitude: 1.4748, longitude: 124.8421 },
  jayapura: { latitude: -2.5916, longitude: 140.669 },
  ambon: { latitude: -3.6954, longitude: 128.1814 },
}

const originIcon = divIcon({
  className: "tracking-map-endpoint-icon",
  html: '<span class="tracking-map-endpoint tracking-map-endpoint-origin"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const destinationIcon = divIcon({
  className: "tracking-map-endpoint-icon",
  html: '<span class="tracking-map-endpoint tracking-map-endpoint-destination"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const completedTransitIcon = divIcon({
  className: "tracking-map-transit-icon",
  html: '<span class="tracking-map-transit tracking-map-transit-completed"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const pendingTransitIcon = divIcon({
  className: "tracking-map-transit-icon",
  html: '<span class="tracking-map-transit tracking-map-transit-pending"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const vehicleIcon = divIcon({
  className: "tracking-map-vehicle-icon",
  html: '<span class="tracking-map-vehicle"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" fill="#d6001c"/><path d="M16 11v3h3" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><circle cx="7" cy="18" r="2" fill="#8f0019"/><circle cx="17" cy="18" r="2" fill="#8f0019"/></svg></span>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

function findCityCoordinates(location: string): Coordinates | undefined {
  const normalized = location.trim().toLocaleLowerCase("id")
  const match = Object.entries(CITY_COORDINATES).find(
    ([city]) => normalized === city || normalized.includes(city),
  )
  return match?.[1]
}

function getLatLng(coordinates?: Coordinates): LatLngTuple | undefined {
  return coordinates
    ? [coordinates.latitude, coordinates.longitude]
    : undefined
}

function areSamePlace(a: Coordinates, b: Coordinates): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.001 &&
    Math.abs(a.longitude - b.longitude) < 0.001
  )
}

function buildRouteStops(shipment: Shipment): RouteStop[] {
  const stops: RouteStop[] = []
  const addStop = (location: string, completed: boolean) => {
    const coordinates = findCityCoordinates(location)
    if (!coordinates) return

    const previous = stops[stops.length - 1]
    if (previous && areSamePlace(coordinates, {
      latitude: previous.position[0],
      longitude: previous.position[1],
    })) {
      previous.completed ||= completed
      return
    }

    stops.push({
      location,
      position: [coordinates.latitude, coordinates.longitude],
      completed,
    })
  }

  addStop(shipment.from, true)
  for (const event of [...shipment.events].sort((a, b) =>
    a.time.localeCompare(b.time),
  )) {
    addStop(event.location, event.done)
  }
  addStop(shipment.to, false)

  return stops
}

function FitRouteBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap()

  useEffect(() => {
    const bounds = latLngBounds(points)
    if (!bounds.isValid()) return

    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.setView(points[0], 11, { animate: false })
      return
    }

    map.fitBounds(bounds.pad(0.25), {
      animate: false,
      maxZoom: 9,
      padding: [24, 24],
    })
  }, [map, points])

  return null
}

export function TrackingMap({ shipment }: TrackingMapProps) {
  const routeStops = useMemo(() => buildRouteStops(shipment), [shipment])
  const latestEvent = [...shipment.events]
    .filter((event) => event.done)
    .sort((a, b) => b.time.localeCompare(a.time))[0]
  const currentLocation = latestEvent?.location
  const origin = findCityCoordinates(shipment.from)
  const destination = findCityCoordinates(shipment.to)
  const current = currentLocation
    ? findCityCoordinates(currentLocation)
    : undefined

  const originPosition = useMemo(() => getLatLng(origin), [origin])
  const destinationPosition = useMemo(
    () => getLatLng(destination),
    [destination],
  )
  const currentPosition = useMemo(() => getLatLng(current), [current])
  const routePoints = useMemo(
    () => routeStops.map((stop) => stop.position),
    [routeStops],
  )
  const lastCompletedIndex = routeStops.reduce(
    (lastIndex, stop, index) => (stop.completed ? index : lastIndex),
    -1,
  )
  const traveledRoute = routePoints.slice(0, lastCompletedIndex + 1)
  const upcomingRoute = routePoints.slice(Math.max(0, lastCompletedIndex))

  const mapCenter = currentPosition ?? originPosition ?? destinationPosition

  return (
    <section
      aria-label={`Peta perkiraan perjalanan paket dari ${shipment.from} ke ${shipment.to}`}
      className="overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-3.5 py-3 sm:px-4">
        <h3 className="inline-flex items-center gap-2 text-sm font-extrabold">
          <MapPinned className="size-4 text-primary" aria-hidden="true" />
          Posisi paket
        </h3>
        <span className="text-xs text-muted-foreground">
          Rute perkiraan · posisi tingkat kota, bukan GPS langsung
        </span>
      </div>

      {mapCenter ? (
        <div className="h-64 w-full sm:h-72">
          <MapContainer
            center={mapCenter}
            zoom={6}
            scrollWheelZoom={false}
            className="tracking-map h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              referrerPolicy="strict-origin"
            />
            {routePoints.length > 1 && <FitRouteBounds points={routePoints} />}

            {traveledRoute.length > 1 && (
              <Polyline
                positions={traveledRoute}
                pathOptions={{
                  color: "#d6001c",
                  opacity: 0.95,
                  weight: 5,
                }}
              />
            )}
            {upcomingRoute.length > 1 && (
              <Polyline
                positions={upcomingRoute}
                pathOptions={{
                  color: "#d6001c",
                  dashArray: "8 9",
                  opacity: 0.45,
                  weight: 5,
                }}
              />
            )}

            {originPosition && (
              <Marker
                position={originPosition}
                icon={originIcon}
                title={`Kota asal: ${shipment.from}`}
                alt={`Kota asal ${shipment.from}`}
              />
            )}
            {destinationPosition && (
              <Marker
                position={destinationPosition}
                icon={destinationIcon}
                title={`Kota tujuan: ${shipment.to}`}
                alt={`Kota tujuan ${shipment.to}`}
              />
            )}
            {routeStops.slice(1, -1).map((stop, index) => (
              <Marker
                key={`${stop.location}-${index}`}
                position={stop.position}
                icon={
                  stop.completed ? completedTransitIcon : pendingTransitIcon
                }
                title={`Titik transit ${stop.completed ? "terlewati" : "berikutnya"}: ${stop.location}`}
                alt={`Titik transit ${stop.location}`}
              />
            ))}
            {currentPosition && (
              <Marker
                position={currentPosition}
                icon={vehicleIcon}
                title={`Posisi perkiraan paket: ${currentLocation}`}
                alt={`Mobil paket di ${currentLocation}`}
                zIndexOffset={1000}
              />
            )}
          </MapContainer>
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2 bg-muted/40 px-6 text-center sm:h-72">
          <MapPin className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-bold">Peta belum tersedia</p>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            Koordinat untuk kota rute ini belum tersedia.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              {currentLocation
                ? "Lokasi pembaruan terakhir"
                : "Menunggu pembaruan lokasi"}
            </p>
            <p className="truncate text-sm font-extrabold">
              {currentLocation ?? shipment.from}
            </p>
            {latestEvent && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {latestEvent.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:justify-end">
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            © OpenStreetMap contributors
          </a>
          {mapCenter && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapCenter[0]}&mlon=${mapCenter[1]}#map=13/${mapCenter[0]}/${mapCenter[1]}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary hover:underline"
            >
              Buka peta penuh
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
      <div className="border-t px-3.5 py-3 sm:px-4">
        <p className="text-xs font-bold text-muted-foreground">Titik rute</p>
        <ol
          aria-label="Urutan kota dan titik transit"
          className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1"
        >
          {routeStops.map((stop, index) => (
            <li
              key={`${stop.location}-${index}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              {index > 0 && (
                <ArrowRight
                  className="size-3 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  stop.completed ? "text-primary" : "text-muted-foreground"
                }
              >
                {stop.location}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
