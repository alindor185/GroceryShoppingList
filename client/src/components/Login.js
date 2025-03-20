import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Paper, Divider, IconButton } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3031/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home');
      } else {
        setError(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        padding: 2
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Sign in
        </Typography>

        <Typography variant="body2" align="center" gutterBottom>
          Don’t have an account?{' '}
          <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
            Get started
          </Link>
        </Typography>

        {error && (
          <Typography variant="body2" color="error" align="center" gutterBottom>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email address"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={credentials.email}
            onChange={handleChange}
            required
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={credentials.password}
            onChange={handleChange}
            required
          />

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <FormControlLabel
              control={<Checkbox name="remember" color="primary" />}
              label="Remember me"
            />
            <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem' }}>
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '10px 0',
              textTransform: 'none',
              marginY: 2,
              '&:hover': { backgroundColor: '#333' },
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Sign in'}
          </Button>
        </form>

        <Divider sx={{ marginY: 2 }}>OR</Divider>

        <Box display="flex" justifyContent="center" gap={2}>
          <IconButton color="primary">
            <GoogleIcon />
          </IconButton>
          <IconButton sx={{ color: '#000' }}>
            <GitHubIcon />
          </IconButton>
          <IconButton sx={{ color: '#1DA1F2' }}>
            <TwitterIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
