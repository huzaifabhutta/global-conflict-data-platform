import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, AlertTriangle } from 'lucide-react';
import { Conflict } from '@/utils/api';

interface ConflictMapProps {
  conflicts: Conflict[];
  onMarkerClick?: (conflict: Conflict) => void;
}

// Component to fit map bounds to markers
function FitBounds({ conflicts }: { conflicts: Conflict[] }) {
  const map = useMap();

  useEffect(() => {
    if (conflicts.length > 0) {
      const bounds = new LatLngBounds(
        conflicts.map(c => [c.latitude, c.longitude])
      );

      // Add some padding and limit maximum zoom
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 10
      });
    }
  }, [conflicts, map]);

  return null;
}

// Get marker color based on fatality count
const getMarkerColor = (fatalities?: number): string => {
  if (!fatalities || fatalities === 0) return '#EAB308'; // yellow-500
  if (fatalities < 10) return '#F97316'; // orange-500
  return '#EF4444'; // red-500
};

// Get marker size based on fatality count
const getMarkerSize = (fatalities?: number): number => {
  if (!fatalities || fatalities === 0) return 8;
  if (fatalities < 5) return 10;
  if (fatalities < 15) return 12;
  if (fatalities < 30) return 15;
  return 18;
};

export default function ConflictMap({ conflicts, onMarkerClick }: ConflictMapProps) {
  const mapRef = useRef<any>(null);

  // Default center (roughly center of the world focusing on conflict-prone areas)
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  return (
    <MapContainer
      ref={mapRef}
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Fit bounds to show all conflicts */}
      {conflicts.length > 0 && <FitBounds conflicts={conflicts} />}

      {/* Render conflict markers */}
      {conflicts.map((conflict) => (
        <CircleMarker
          key={conflict.id}
          center={[conflict.latitude, conflict.longitude]}
          radius={getMarkerSize(conflict.fatalities)}
          fillColor={getMarkerColor(conflict.fatalities)}
          color="#ffffff"
          weight={2}
          opacity={0.8}
          fillOpacity={0.7}
          eventHandlers={{
            click: () => onMarkerClick?.(conflict),
          }}
        >
          <Popup className="conflict-popup" maxWidth={320}>
            <div className="p-2">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                  {conflict.title}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {conflict.eventType}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span>{format(new Date(conflict.date), 'MMM dd, yyyy')}</span>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span>{conflict.country}, {conflict.region}</span>
                </div>

                {conflict.fatalities && (
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span>{conflict.fatalities.toLocaleString()} fatalities</span>
                  </div>
                )}

                <div className="flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span>Source: {conflict.source}</span>
                </div>
              </div>

              {conflict.description && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-700 line-clamp-3">
                    {conflict.description}
                  </p>
                </div>
              )}

              {onMarkerClick && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick(conflict);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                  >
                    View Details →
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Show message when no conflicts */}
      {conflicts.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg z-1000">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No conflicts match your current filters</p>
          </div>
        </div>
      )}
    </MapContainer>
  );
}