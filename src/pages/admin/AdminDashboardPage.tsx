import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">Administration</Typography>
        <Typography variant="body1" color="text.secondary">Bienvenue {user?.first_name} {user?.last_name}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Vue d'ensemble Admin</Typography>
            <Typography variant="body1">
              Les fonctionnalités avancées (gestion des utilisateurs, quotas, audit logs) seront implémentées lors de la Phase 8 (Administration).
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
