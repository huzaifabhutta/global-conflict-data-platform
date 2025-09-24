import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import {
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { conflictsApi, Conflict } from '@/utils/api';

interface FilterForm {
  search: string;
  country: string;
  region: string;
  eventType: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
}

export default function Conflicts() {
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  const {
    register,
    watch,
    setValue,
    reset
  } = useForm<FilterForm>({
    defaultValues: {
      search: '',
      country: '',
      region: '',
      eventType: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'desc'
    }
  });

  const filters = watch();
  const limit = 10;

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    };

    if (filters.country) params.country = filters.country;
    if (filters.region) params.region = filters.region;
    if (filters.eventType) params.eventType = filters.eventType;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    return params;
  }, [page, filters]);

  const { data, isLoading, error } = useQuery(
    ['conflicts', queryParams],
    () => conflictsApi.getConflicts(queryParams),
    {
      keepPreviousData: true,
    }
  );

  // Get unique values for filter dropdowns
  const { data: regionsData } = useQuery(
    'regions',
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

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await conflictsApi.exportData(format);

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conflicts.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conflicts.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleSort = (field: string) => {
    if (filters.sortBy === field) {
      setValue('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setValue('sortBy', field);
      setValue('sortOrder', 'desc');
    }
    setPage(1);
  };

  const clearFilters = () => {
    reset();
    setPage(1);
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">Error loading conflicts. Please try again.</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const conflicts = data?.data.conflicts || [];
  const pagination = data?.data.pagination;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Conflicts</h1>
                <p className="text-gray-600 mt-2">Browse and analyze conflict data</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="btn-secondary flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="btn-primary flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  {pagination && (
                    <>Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} conflicts</>
                  )}
                </p>
                {isLoading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {getSortIcon('date')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('country')}
                    >
                      <div className="flex items-center">
                        Country
                        {getSortIcon('country')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('fatalities')}
                    >
                      <div className="flex items-center">
                        Fatalities
                        {getSortIcon('fatalities')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conflicts.map((conflict) => (
                    <tr key={conflict.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {format(new Date(conflict.date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={conflict.title}>
                          {conflict.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {conflict.country}
                        </div>
                        <div className="text-xs text-gray-500">{conflict.region}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {conflict.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conflict.fatalities ? (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-red-400" />
                            {conflict.fatalities.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedConflict(conflict)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {conflicts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No conflicts found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{pagination.page}</span> of{' '}
                      <span className="font-medium">{pagination.totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
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
                    ✕
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
                      <p className="text-gray-700">{format(new Date(selectedConflict.date), 'MMMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Event Type</h4>
                      <p className="text-gray-700">{selectedConflict.eventType}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Country</h4>
                      <p className="text-gray-700">{selectedConflict.country}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Region</h4>
                      <p className="text-gray-700">{selectedConflict.region}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fatalities</h4>
                      <p className="text-gray-700">{selectedConflict.fatalities || 'Not reported'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Source</h4>
                      <p className="text-gray-700">{selectedConflict.source}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-gray-700">
                      {selectedConflict.latitude.toFixed(4)}, {selectedConflict.longitude.toFixed(4)}
                    </p>
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