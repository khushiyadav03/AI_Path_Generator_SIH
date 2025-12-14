// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';   // ← ONLY THIS

function Dashboard({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/posts/');
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      setError('');

      console.log('[Dashboard] Creating post with data:', formData);
      await api.post('/api/posts/', formData);   // ← THIS MUST BE api.post

      setFormData({ title: '', content: '' });
      setShowCreateForm(false);
      fetchPosts();
    } catch (err) {
      console.error('[Dashboard] Create post error:', err);
      const msg = err.response?.data?.detail || 'Unknown error';
      setError(`Failed to create post: ${msg}`);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await api.post('/api/auth/logout/', { refresh });
    } catch (e) { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (onLogout) onLogout();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>

      <button onClick={() => setShowCreateForm(true)} style={{ padding: '10px 20px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', marginBottom: '20px' }}>
        Create New Post
      </button>

      {error && <div style={{ padding: '10px', background: '#ffe6e6', color: 'red', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

      {showCreateForm && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h3>Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '120px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={creating} style={{ padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px' }}>
                {creating ? 'Creating...' : 'Create Post'}
              </button>
              <button type="button" onClick={() => { setShowCreateForm(false); setFormData({ title: '', content: '' }); setError(''); }} style={{ padding: '10px 20px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3>Recent Posts</h3>
        {loading ? <p>Loading...</p> : posts.length === 0 ? <p>No posts yet.</p> : posts.map(post => (
          <div key={post.id} style={{ background: '#fff', padding: '20px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <div style={{ fontSize: '14px', color: '#999' }}>
              By {post.author_username} • {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;