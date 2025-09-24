import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import {
  MapPin,
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { conflictsApi, Conflict } from '@/utils/api';

// Dynamic import for the map component to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/ConflictMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

interface MapFilterForm {
  country: string;
  region: string;
  eventType: string;
  startDate: string;
  endDate: string;
  minFatalities: number;
}

export default function MapView() {
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    register,
    watch,
    reset
  } = useForm<MapFilterForm>({
    defaultValues: {
      country: '',
      region: '',
      eventType: '',
      startDate: '',
      endDate: '',
      minFatalities: 0
    }
  });

  const filters = watch();

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      limit: 1000, // Get more data for map view
      sortBy: 'date',
      sortOrder: 'desc'
    };

    if (filters.country) params.country = filters.country;
    if (filters.region) params.region = filters.region;
    if (filters.eventType) params.eventType = filters.eventType;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    return params;
  }, [filters]);

  const { data, isLoading } = useQuery(
    ['map-conflicts', queryParams],
    () => conflictsApi.getConflicts(queryParams)
  );

  // Get unique values for filter dropdowns
  const { data: regionsData } = useQuery(
    'map-regions',
    () => conflictsApi.getConflicts({ limit: 1000 }),
    {
      select: (data) => {
        const conflicts = data.data.conflicts;
        const regions = [...new Set(conflicts.map(c => c.region))].sort();
        const countries = [...new Set(conflicts.map(c => c.country))].sort();
        const eventTypes = [...new Set(conflicts.map(c => c.eventType))].sort();
        return { regions, countries, eventTypes };
      }
    }
  );

  // Filter conflicts by minimum fatalities
  const filteredConflicts = useMemo(() => {
    if (!data?.data.conflicts) return [];

    return data.data.conflicts.filter(conflict => {
      if (filters.minFatalities > 0) {
        return (conflict.fatalities || 0) >= filters.minFatalities;
      }
      return true;
    });
  }, [data?.data.conflicts, filters.minFatalities]);

  const clearFilters = () => {
    reset();
  };

  // Group conflicts by event type for legend
  const conflictStats = useMemo(() => {
    if (!filteredConflicts.length) return {};

    const stats: Record<string, { count: number; fatalities: number }> = {};

    filteredConflicts.forEach(conflict => {
      const type = conflict.eventType;
      if (!stats[type]) {
        stats[type] = { count: 0, fatalities: 0 };
      }
      stats[type].count += 1;
      stats[type].fatalities += conflict.fatalities || 0;
    });

    return stats;
  }, [filteredConflicts]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Map View</h1>
                <p className="text-gray-600 mt-2">Geographic visualization of conflict data</p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card p-4">
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Conflicts</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {filteredConflicts.length.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Fatalities</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {filteredConflicts.reduce((sum, c) => sum + (c.fatalities || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Countries Affected</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {new Set(filteredConflicts.map(c => c.country)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select {...register('country')} className="input-field w-full">
                    <option value="">All Countries</option>
                    {regionsData?.countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select {...register('region')} className="input-field w-full">
                    <option value="">All Regions</option>
                    {regionsData?.regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select {...register('eventType')} className="input-field w-full">
                    <option value="">All Event Types</option>
                    {regionsData?.eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. Fatalities
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('minFatalities', { valueAsNumber: true })}
                    className="input-field w-full"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conflict Locations</h3>
                {isLoading ? (
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading conflict data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 rounded-lg overflow-hidden">
                    <DynamicMap
                      conflicts={filteredConflicts}
                      onMarkerClick={setSelectedConflict}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Legend and Event Types */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
                <div className="space-y-3">
                  {Object.entries(conflictStats).map(([type, stats]) => (
                    <div key={type} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate" title={type}>
                          {type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {stats.count} incidents
                          {stats.fatalities > 0 && ` • ${stats.fatalities.toLocaleString()} fatalities`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {Object.keys(conflictStats).length === 0 && (
                    <p className="text-sm text-gray-500">No data to display</p>
                  )}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span>High casualty (10+ fatalities)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <span>Medium casualty (1-9 fatalities)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <span>Low/No casualties reported</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">How to use:</p>
                      <ul className="space-y-1">
                        <li>• Click markers for details</li>
                        <li>• Use filters to refine data</li>
                        <li>• Zoom and pan to explore</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conflict Detail Modal */}
        {selectedConflict && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Conflict Details</h3>
                  <button
                    onClick={() => setSelectedConflict(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Title</h4>
                    <p className="text-gray-700">{selectedConflict.title}</p>
                  </div>

                  {selectedConflict.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Description</h4>
                      <p className="text-gray-700">{selectedConflict.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Date</h4>
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(selectedConflict.date), 'MMMM dd, yyyy')}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Event Type</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {selectedConflict.eventType}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Location</h4>
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedConflict.country}, {selectedConflict.region}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fatalities</h4>
                      <div className="flex items-center text-gray-700">
                        <Users className="w-4 h-4 mr-2" />
                        {selectedConflict.fatalities ? selectedConflict.fatalities.toLocaleString() : 'Not reported'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Coordinates</h4>
                    <p className="text-gray-700 font-mono text-sm">
                      {selectedConflict.latitude.toFixed(6)}, {selectedConflict.longitude.toFixed(6)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Source</h4>
                    <p className="text-gray-700">{selectedConflict.source}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedConflict(null)}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}