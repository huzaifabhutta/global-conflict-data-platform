import React from 'react';
import { useQuery } from 'react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { TrendingUp, Users, AlertTriangle, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { conflictsApi } from '@/utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
          {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery(
    'conflict-stats',
    () => conflictsApi.getStats(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: recentConflicts } = useQuery(
    'recent-conflicts',
    () => conflictsApi.getConflicts({ limit: 5, sortBy: 'date', sortOrder: 'desc' })
  );

  if (isLoading || !stats) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const statsData = stats.data;

  // Chart configurations
  const regionChartData = {
    labels: statsData.conflictsByRegion.slice(0, 8).map(item => item.region),
    datasets: [
      {
        label: 'Conflicts by Region',
        data: statsData.conflictsByRegion.slice(0, 8).map(item => item.count),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
          '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ],
        borderWidth: 1,
      },
    ],
  };

  const eventTypeChartData = {
    labels: statsData.conflictsByEventType.slice(0, 6).map(item => item.eventType),
    datasets: [
      {
        data: statsData.conflictsByEventType.slice(0, 6).map(item => item.count),
        backgroundColor: [
          '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
        ],
      },
    ],
  };

  // Sample trend data (in real app, this would come from API)
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Conflicts',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Global Conflict Data Overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Conflicts"
              value={statsData.totalConflicts}
              icon={AlertTriangle}
              color="bg-red-500"
            />
            <StatCard
              title="Total Fatalities"
              value={statsData.totalFatalities}
              icon={Users}
              color="bg-orange-500"
            />
            <StatCard
              title="Recent Conflicts"
              value={statsData.recentConflicts}
              icon={Calendar}
              trend="Last 30 days"
              color="bg-blue-500"
            />
            <StatCard
              title="Active Regions"
              value={statsData.conflictsByRegion.length}
              icon={TrendingUp}
              color="bg-green-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conflicts by Region</h3>
              <Bar data={regionChartData} options={chartOptions} />
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types Distribution</h3>
              <Pie data={eventTypeChartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conflict Trends</h3>
                <Line data={trendData} options={chartOptions} />
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conflicts</h3>
              <div className="space-y-4">
                {recentConflicts?.data.conflicts.slice(0, 5).map((conflict) => (
                  <div key={conflict.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {conflict.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {conflict.country} • {new Date(conflict.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {conflict.fatalities && `${conflict.fatalities} fatalities`}
                    </p>
                  </div>
                )) || (
                  <div className="text-sm text-gray-500">Loading recent conflicts...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}