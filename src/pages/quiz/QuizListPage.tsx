import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, 
  Grid, Card, CardContent, CardActions, Chip, Slider
} from '@mui/material';
import { Add as AddIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quiz.service';
import { documentService } from '../../services/document.service';
import { Quiz } from '../../types/quiz';
import { Document } from '../../types/document';

const QuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [openModal, setOpenModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDocId, setNewDocId] = useState<number | ''>('');
  const [newDifficulty, setNewDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [newNumQuestions, setNewNumQuestions] = useState<number>(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qs, ds] = await Promise.all([
        quizService.getQuizzes(),
        documentService.getDocuments()
      ]);
      setQuizzes(qs);
      setDocuments(ds.filter(d => d.status === 'READY'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!newTitle || !newDocId) return;
    setGenerating(true);
    try {
      const quiz = await quizService.generateQuiz({
        document_id: newDocId,
        title: newTitle,
        difficulty: newDifficulty,
        num_questions: newNumQuestions
      });
      setQuizzes([quiz, ...quizzes]);
      setOpenModal(false);
      setNewTitle('');
      setNewDocId('');
      setNewDifficulty('MEDIUM');
      setNewNumQuestions(10);
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.detail || "Erreur lors de la génération du quiz.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Mes Quiz</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: 2 }}
        >
          Générer un Quiz
        </Button>
      </Box>

      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">Aucun quiz généré pour le moment.</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenModal(true)}>Créer mon premier Quiz</Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map(quiz => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{quiz.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip size="small" label={quiz.difficulty} color={quiz.difficulty === 'EASY' ? 'success' : quiz.difficulty === 'HARD' ? 'error' : 'warning'} />
                    <Chip size="small" label={`${quiz.questions.length} questions`} variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Généré le {new Date(quiz.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    endIcon={<PlayArrowIcon />}
                    onClick={() => navigate(`/quizzes/${quiz.id}`)}
                    sx={{ textTransform: 'none' }}
                  >
                    Démarrer / Voir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal Génération */}
      <Dialog open={openModal} onClose={() => !generating && setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Générer un nouveau Quiz avec l'IA</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Titre du Quiz"
              fullWidth
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={generating}
            />
            
            <FormControl fullWidth disabled={generating}>
              <InputLabel>Document source</InputLabel>
              <Select
                value={newDocId}
                label="Document source"
                onChange={(e) => setNewDocId(e.target.value as number)}
              >
                {documents.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth disabled={generating}>
              <InputLabel>Niveau de difficulté</InputLabel>
              <Select
                value={newDifficulty}
                label="Niveau de difficulté"
                onChange={(e) => setNewDifficulty(e.target.value as any)}
              >
                <MenuItem value="EASY">Facile (Questions directes)</MenuItem>
                <MenuItem value="MEDIUM">Moyen (Réflexion)</MenuItem>
                <MenuItem value="HARD">Difficile (Analyse poussée)</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom>Nombre de questions : {newNumQuestions}</Typography>
              <Slider
                value={newNumQuestions}
                onChange={(e, val) => setNewNumQuestions(val as number)}
                step={5}
                marks
                min={5}
                max={30}
                disabled={generating}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} disabled={generating}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleGenerate} 
            disabled={generating || !newTitle || !newDocId}
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {generating ? 'Génération IA en cours...' : 'Générer le Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizListPage;
