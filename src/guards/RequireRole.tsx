import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/user';
import { Box, CircularProgress, Typography } from '@mui/material';

export const RequireRole = ({ children, role }: { children: JSX.Element, role: Role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    // Redirection simple ou affichage de message non autorisé
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h5" color="error">Accès non autorisé.</Typography>
      </Box>
    );
  }

  return children;
};
