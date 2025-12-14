import React, { useState } from 'react';
import api from '../api'; // Isse hum API call karenge

function SignupPage() {
  // Yeh state hamare form ke data ko store karega
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    academic_year: 1, // Default 1st year
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Jaise hi user form mein kuch type karega, yeh function state ko update karega
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user starts typing
  };

  // Jab user "Sign Up" button dabayega
  const handleSubmit = async (e) => {
    e.preventDefault(); // Page ko reload hone se rokein

    // Check karein ki dono password match karte hain
    if (formData.password !== formData.password2) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call ke liye data taiyyar karein
      const dataToSubmit = {
        username: formData.username,
        email: formData.email,
        password1: formData.password,  // Django expects password1, not password
        password2: formData.password2,
        academic_year: parseInt(formData.academic_year), // Year ko number mein convert karein
      };

      // API endpoint par POST request bhejein
      const response = await api.post('/api/auth/registration/', dataToSubmit);

      // Success
      console.log(response.data);
      alert('Sign up successful! Please log in.');
      
    } catch (error) {
      console.error('Sign up error:', error);

      if (error.response) {
        // Server se error aaya
        const errorData = error.response.data;
        // Display the first error message found
        const firstError = Object.values(errorData).flat()[0];
        setError(firstError || 'An error occurred during signup.');
      } else if (error.request) {
        setError('Cannot connect to server. Is it running?');
      } else {
        setError('An error occurred: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Sign Up</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#ffe6e6',
          border: '1px solid #ffcccc',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Username:
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Enter username"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Enter email"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Enter password"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Confirm Password:
          </label>
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Confirm password"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Academic Year:
          </label>
          <select
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
          </select>
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default SignupPage;