"use client";

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { activeUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SALESPERSON',
    password: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (activeUser?.role !== 'ADMIN') {
    return <div className={styles.container}><h1>Access Denied</h1><p>You must be an administrator to view this page.</p></div>;
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        setFormData({ name: '', email: '', role: 'SALESPERSON', password: '' });
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error creating user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (e) {
      alert("Error deleting user");
    }
  };

  return (
    <div className={`${styles.container} fade-in`}>
      <header className={styles.header}>
        <div>
          <h1>System Settings</h1>
          <p>Manage users, permissions, and organization defaults.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </header>

      <div className={styles.content}>
        <div className="card">
          <div className={styles.tableHeader}>
            <h3>User Management</h3>
            <span>{users.length} Total Users</span>
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{user.name.charAt(0)}</div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles['role-' + user.role.toLowerCase()]}`}>
                        {user.role === 'ADMIN' ? <Shield size={12} /> : <UserIcon size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === activeUser.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Create New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>System Role</label>
                <select 
                  className="input-field" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="SALESPERSON">Salesperson</option>
                  <option value="LOAN_PARTNER">Bajaj / Loan Partner</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                </select>
              </div>
              <div className="input-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Leave blank for default"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
