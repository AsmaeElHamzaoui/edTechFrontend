import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Timer as TimeIcon,
  Quiz as QuizIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { analyticsService, DashboardData } from '../../services/analytics.service';
import { useAuth } from '../../hooks/useAuth';

const StatCard = ({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle?: string }) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, height: '100%' }}>
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Paper>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await analyticsService.getDashboard(30);
        setData(result);
      } catch (err) {
        setError("Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">Bonjour, {user?.first_name} !</Typography>
        <Typography variant="body1" color="text.secondary">Voici votre progression sur les 30 derniers jours.</Typography>
      </Box>

      {data && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Documents" 
              value={data.documents.total} 
              subtitle={`${data.documents.ready} prêts`} 
              icon={<DocumentIcon fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Temps d'apprentissage" 
              value={formatTime(data.learning_time_seconds)} 
              icon={<TimeIcon fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Score Moyen" 
              value={`${data.quiz.average_score}%`} 
              subtitle={`${data.quiz.total_attempts} quiz tentés`} 
              icon={<QuizIcon fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Stockage" 
              value={`${data.storage.percentage}%`} 
              subtitle={`${(data.storage.used_bytes / 1024 / 1024).toFixed(1)} MB / ${(data.storage.max_bytes / 1024 / 1024).toFixed(0)} MB`} 
              icon={<StorageIcon fontSize="large" />} 
            />
          </Grid>
        </Grid>
      )}

      {/* Reste du dashboard (Progression Chart, Concepts Faibles) à implémenter dans les phases suivantes */}
      <Box mt={4}>
        <Paper sx={{ p: 3, borderRadius: 2, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Les graphiques de progression et recommandations seront intégrés dans la Phase 6.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage;
