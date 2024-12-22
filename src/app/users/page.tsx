'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  email: string;
  password?: string;
  createdAt?: string;
  isGuest: boolean;
  hasAcceptedTerms: boolean;
  accessLevel: number;
}

interface PaginatedResult {
  total: number;
  limit: number;
  skip: number;
  data: User[];
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function UsersPage() {
  const { user, logout, isLoading: authLoading } = useAuthContext();
  const { client, clientType, switchClient } = useClient();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    isGuest: false,
    hasAcceptedTerms: true,
    accessLevel: 1
  });
  const [editForm, setEditForm] = useState({
    hasAcceptedTerms: true,
    accessLevel: 0
  });
  
  // Pagination state
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  const fetchUsers = async (page = 1) => {
    if (authLoading || !user) return;
    setIsLoading(true);
    try {
      const skip = (page - 1) * limit;
      const response = await client.service('users').find({
        query: {
          $limit: limit,
          $skip: skip,
        }
      }) as PaginatedResult;

      setUsers(response.data);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchUsers(currentPage);
    }
  }, [currentPage, authLoading, user]);

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.service('users').create(newUser);
      setNewUser({
        email: '',
        password: '',
        isGuest: false,
        hasAcceptedTerms: true,
        accessLevel: 1
      });
      toast.success('User created successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      await client.service('users').patch(isEditing, {
        hasAcceptedTerms: editForm.hasAcceptedTerms,
        accessLevel: editForm.accessLevel
      });
      setIsEditing(null);
      toast.success('User updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (userId?: string) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }

      setIsLoading(true);
      await client.service('users').remove(userId);
      toast.success('User deleted successfully');
      
      // Refresh the current page
      await fetchUsers(currentPage);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (user: User) => {
    setIsEditing(user._id);
    setEditForm({
      hasAcceptedTerms: user.hasAcceptedTerms,
      accessLevel: user.accessLevel
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect to login page even if logout fails
      router.push('/login');
    }
  };

  return (
    <>
      {authLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <div className="p-4">
          {/* Header */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Users Management</h1>
              <p className="text-gray-600">Current client: {clientType}</p>
            </div>
            <div className="flex gap-2">
              <select
                value={clientType}
                onChange={(e) => switchClient(e.target.value as 'rest' | 'socket')}
                className="border rounded px-2 py-1"
              >
                <option value="rest">REST Client</option>
                <option value="socket">WebSocket Client</option>
              </select>
              <button
                onClick={handleLogout}
                className="border rounded px-4 py-1 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Create User Form */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Create New User</h2>
            <p className="mb-4">Add a new user to your application</p>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-md">
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="accessLevel" className="block mb-1">Access Level</label>
                <input
                  id="accessLevel"
                  type="number"
                  value={newUser.accessLevel}
                  onChange={(e) => setNewUser({ ...newUser, accessLevel: parseInt(e.target.value) })}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="hasAcceptedTerms"
                  type="checkbox"
                  checked={newUser.hasAcceptedTerms}
                  onChange={(e) => setNewUser({ ...newUser, hasAcceptedTerms: e.target.checked })}
                  className="border rounded"
                />
                <label htmlFor="hasAcceptedTerms">Has Accepted Terms</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isGuest"
                  type="checkbox"
                  checked={newUser.isGuest}
                  onChange={(e) => setNewUser({ ...newUser, isGuest: e.target.checked })}
                  className="border rounded"
                />
                <label htmlFor="isGuest">Is Guest</label>
              </div>
              <button
                type="submit"
                className="border rounded px-4 py-1 bg-blue-500 text-white hover:bg-blue-600 w-fit"
              >
                Create User
              </button>
            </form>
          </div>

          {/* Users List */}
          <div>
            <h2 className="text-xl font-bold mb-2">Users List</h2>
            <p className="mb-4">Showing {users.length} of {total} users</p>
            
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <>
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Access Level</th>
                      <th className="text-left py-2">Terms</th>
                      <th className="text-left py-2">Created At</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b">
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">{user.accessLevel}</td>
                        <td className="py-2">{user.hasAcceptedTerms ? 'Yes' : 'No'}</td>
                        <td className="py-2">{formatDate(user.createdAt)}</td>
                        <td className="py-2">
                          {isEditing === user._id ? (
                            <div className="flex gap-2">
                              <div>
                                <label className="block text-sm">Access Level</label>
                                <input
                                  type="number"
                                  value={editForm.accessLevel}
                                  onChange={(e) => setEditForm({ ...editForm, accessLevel: parseInt(e.target.value) })}
                                  className="border rounded px-2 py-1"
                                />
                              </div>
                              <div>
                                <label className="block text-sm">Has Accepted Terms</label>
                                <input
                                  type="checkbox"
                                  checked={editForm.hasAcceptedTerms}
                                  onChange={(e) => setEditForm({ ...editForm, hasAcceptedTerms: e.target.checked })}
                                  className="border rounded px-2 py-1"
                                />
                              </div>
                              <button
                                onClick={handleUpdate}
                                className="border rounded px-3 py-1 bg-green-500 text-white hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setIsEditing(null)}
                                className="border rounded px-3 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(user)}
                                className="border rounded px-3 py-1"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="border rounded px-3 py-1 bg-red-500 text-white hover:bg-red-600"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center">
                  <div>
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="border rounded px-3 py-1 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`border rounded px-3 py-1 ${
                          currentPage === page ? 'bg-blue-500 text-white' : ''
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="border rounded px-3 py-1 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
} 