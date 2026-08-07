import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link as MuiLink, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-form-hooks'; // No, use react-hook-form
import { useForm as useReactHookForm } from 'react-hook-form';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useReactHookForm();
  const [authError, setAuthError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      await login(data);
      navigate('/');
    } catch (err) {
      setAuthError('Invalid credentials or server error. Please try again.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default', p: 2 }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, opacity: 0.4 }}>
        <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(15,23,42,0) 70%)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(15,23,42,0) 70%)', filter: 'blur(40px)' }} />
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, width: '100%', maxWidth: 480, zIndex: 1, borderRadius: 4, border: '1px solid #334155', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(20px)' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ background: 'linear-gradient(to right, #fff, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter your credentials to access your account
          </Typography>
        </Box>

        {authError && <Alert severity="error" sx={{ mb: 3 }}>{authError}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            {...register('username', { required: 'Username is required' })}
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 4 }}
          />
          <Button fullWidth type="submit" variant="contained" color="primary" size="large" sx={{ py: 1.5, fontSize: '1.1rem', mb: 3 }}>
            Sign In
          </Button>
        </form>

        <Typography variant="body2" align="center" color="text.secondary">
          Don't have an account?{' '}
          <MuiLink component={Link} to="/register" color="primary.main" underline="hover" fontWeight="bold">
            Sign Up
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
