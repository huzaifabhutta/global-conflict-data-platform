import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { Crown, User, Shield, Calendar, Mail, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api, User as UserType } from '@/utils/api';
import { getUser } from '@/utils/auth';

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const queryClient = useQueryClient();
  const currentUser = getUser();

  // Redirect if not admin
  if (currentUser?.role !== 'ADMIN') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const { data: usersData, isLoading, error } = useQuery(
    'admin-users',
    () => api.get<{ users: UserType[]; total: number }>('/api/users'),
    {
      select: (response) => response.data
    }
  );

  const updateRoleMutation = useMutation(
    ({ userId, role }: { userId: string; role: string }) =>
      api.put(`/api/users/${userId}/role`, { role }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User role updated successfully');
        setSelectedUser(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update user role');
      },
    }
  );

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">Error loading users. Please try again.</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const users = usersData?.users || [];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
                <p className="text-gray-600 mt-2">Manage users and platform settings</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Administrators</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Regular Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'USER').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage user roles and permissions
              </p>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                  {user.email}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.role === 'ADMIN' ? (
                              <>
                                <Crown className="w-4 h-4 text-purple-500 mr-2" />
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Administrator
                                </span>
                              </>
                            ) : (
                              <>
                                <User className="w-4 h-4 text-gray-500 mr-2" />
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  User
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.id !== currentUser?.id && (
                            <div className="relative">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-primary-600 hover:text-primary-900 flex items-center"
                              >
                                <MoreVertical className="w-4 h-4" />
                                <span className="ml-1">Manage</span>
                              </button>
                            </div>
                          )}
                          {user.id === currentUser?.id && (
                            <span className="text-gray-400 text-xs">You</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Role Change Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage User Role</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary-600">
                        {selectedUser.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.email}</p>
                      <p className="text-sm text-gray-500">
                        Current role: {selectedUser.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Change this user's role:
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleRoleChange(selectedUser.id, 'USER')}
                      disabled={selectedUser.role === 'USER' || updateRoleMutation.isLoading}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${
                        selectedUser.role === 'USER'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-3 text-gray-500" />
                        <div>
                          <p className="font-medium">Regular User</p>
                          <p className="text-sm text-gray-500">
                            Can view and analyze conflict data
                          </p>
                        </div>
                        {selectedUser.role === 'USER' && (
                          <span className="ml-auto text-green-600">Current</span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleRoleChange(selectedUser.id, 'ADMIN')}
                      disabled={selectedUser.role === 'ADMIN' || updateRoleMutation.isLoading}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${
                        selectedUser.role === 'ADMIN'
                          ? 'border-purple-200 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center">
                        <Crown className="w-5 h-5 mr-3 text-purple-500" />
                        <div>
                          <p className="font-medium">Administrator</p>
                          <p className="text-sm text-gray-500">
                            Full access including user management
                          </p>
                        </div>
                        {selectedUser.role === 'ADMIN' && (
                          <span className="ml-auto text-purple-600">Current</span>
                        )}
                      </div>
                    </button>
                  </div>

                  {updateRoleMutation.isLoading && (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Updating role...</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="btn-secondary"
                  >
                    Cancel
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