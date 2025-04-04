import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

import './App.css';
import {User, UserFormData, UsersResponse} from "./type";

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    uid: '',
    name: '',
    email: '',
    directory: 'default'
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [weavyUrl, setWeavyUrl] = useState<string>('https://8015b5dbc0724d38882ac90397c27649.weavy.io');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<UsersResponse>(`${weavyUrl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      const usersData = Array.isArray(response.data?.data) ? response.data.data : [];
      setUsers(usersData);
    } catch (err) {
      const error = err as AxiosError;
      setError(`Failed to fetch users: ${error.message}`);
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [apiKey, weavyUrl]);

  useEffect(() => {
    setApiKey(process.env.REACT_APP_WEAVY_API_KEY || '');
    setWeavyUrl(process.env.REACT_APP_WEAVY_URL || 'https://8015b5dbc0724d38882ac90397c27649.weavy.io');
  }, []);

  useEffect(() => {
    if (apiKey && weavyUrl) {
      fetchUsers();
    }
  }, [apiKey, weavyUrl, fetchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingUserId) {
        await axios.patch<User>(`${weavyUrl}/api/users/${editingUserId}`, formData, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        await axios.post<User>(`${weavyUrl}/api/users`, formData, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
      }
      await fetchUsers();
      setFormData({
        uid: '',
        name: '',
        email: '',
        directory: 'default'
      });
      setEditingUserId(null);
    } catch (err) {
      const error = err as AxiosError;
      setError(`Operation failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      uid: user.uid,
      name: user.name,
      email: user.email || '',
      directory: user.directory?.name || 'default',
      given_name: user.given_name,
      family_name: user.family_name,
      phone_number: user.phone_number
    });
    setEditingUserId(user.uid);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${weavyUrl}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      await fetchUsers();
    } catch (err) {
      const error = err as AxiosError;
      setError(`Failed to delete user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="App">
        <header className="App-header">
          <h1>Weavy User Management</h1>
        </header>
        <main>
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-indicator">Loading...</div>}

          <div className="form-container">
            <h2>{editingUserId ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>User ID (unique):</label>
                <input
                    type="text"
                    name="uid"
                    value={formData.uid}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingUserId}
                />
              </div>
              <div className="form-group">
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Directory:</label>
                <input
                    type="text"
                    name="directory"
                    value={formData.directory}
                    onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {editingUserId ? 'Update' : 'Create'}
                </button>
                {editingUserId && (
                    <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            uid: '',
                            name: '',
                            email: '',
                            directory: 'default'
                          });
                          setEditingUserId(null);
                        }}
                        disabled={loading}
                    >
                      Cancel
                    </button>
                )}
              </div>
            </form>
          </div>

          <div className="users-list">
            <h2>Users</h2>
            {users.length === 0 ? (
                <p>No users found</p>
            ) : (
                <table>
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Directory</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.uid}</td>
                        <td>{user.name}</td>
                        <td>{user.email || '-'}</td>
                        <td>{user.directory?.name || 'default'}</td>
                        <td>
                          <button
                              onClick={() => handleEdit(user)}
                              disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                              onClick={() => handleDelete(user.uid)}
                              disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
            )}
          </div>
        </main>
      </div>
  );
};

export default App;