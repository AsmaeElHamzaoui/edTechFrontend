import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, Button, 
  Radio, RadioGroup, FormControlLabel, FormControl, 
  TextField, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quiz.service';
import { Quiz, QuizAttempt, AnswerData, SubmitAttemptResponse } from '../../types/quiz';

const QuizAttemptPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, AnswerData>>({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SubmitAttemptResponse | null>(null);

  useEffect(() => {
    if (id) {
      loadQuizAndAttempt(parseInt(id));
    }
  }, [id]);

  const loadQuizAndAttempt = async (quizId: number) => {
    try {
      setLoading(true);
      const q = await quizService.getQuiz(quizId);
      setQuiz(q);
      
      const { attempt, saved_answers } = await quizService.startAttempt(quizId);
      setAttempt(attempt);
      
      // Load saved answers into local state
      const initialAnswers: Record<number, AnswerData> = {};
      saved_answers.forEach(a => {
        initialAnswers[a.question_id] = a;
      });
      setAnswers(initialAnswers);
      
      if (attempt.status === 'SUBMITTED') {
         // Auto-submit on frontend to display results immediately if already submitted in backend
         const res = await quizService.submitAttempt(quizId);
         setResults(res);
      }
      
    } catch (e) {
      console.error(e);
      alert("Erreur lors du chargement du quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceChange = async (questionId: number, choiceId: number) => {
    if (results) return; // Cannot edit after submit
    
    const newAnswer: AnswerData = { question_id: questionId, selected_choice_id: choiceId };
    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    
    try {
      await quizService.saveAnswer(quiz!.id, newAnswer);
    } catch (e) {
      console.error("Failed to auto-save", e);
    }
  };

  const handleOpenAnswerChange = (questionId: number, text: string) => {
    if (results) return;
    const newAnswer: AnswerData = { question_id: questionId, open_answer_text: text };
    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
  };

  const handleOpenAnswerBlur = async (questionId: number) => {
    if (results) return;
    try {
      await quizService.saveAnswer(quiz!.id, answers[questionId] || { question_id: questionId });
    } catch (e) {
      console.error("Failed to auto-save", e);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    if (!window.confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? L'IA va corriger les questions ouvertes.")) return;
    
    setSubmitting(true);
    try {
      const res = await quizService.submitAttempt(quiz.id);
      setResults(res);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (!quiz) return <Typography>Introuvable.</Typography>;

  return (
    <Box maxWidth="md" mx="auto">
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>{quiz.title}</Typography>
        <Typography color="text.secondary" gutterBottom>
          Difficulté : {quiz.difficulty} | Questions : {quiz.questions.length}
        </Typography>
        {results && (
          <Alert severity={results.score >= 50 ? "success" : "warning"} sx={{ mt: 2 }}>
            <Typography variant="h6">Score final : {results.score.toFixed(1)}%</Typography>
            <Typography>{results.correct_answers} bonnes réponses sur {results.total_questions}.</Typography>
          </Alert>
        )}
      </Paper>

      {quiz.questions.map((q, index) => {
        const result = results?.results.find(r => r.question_id === q.id);
        const ans = answers[q.id];
        
        return (
          <Paper key={q.id} sx={{ p: 4, mb: 3, borderRadius: 3, borderLeft: result ? (result.is_correct ? '6px solid #2e7d32' : '6px solid #d32f2f') : 'none' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {index + 1}. {q.question_text}
            </Typography>
            
            {(q.question_type === 'MCQ' || q.question_type === 'BOOLEAN') && (
              <FormControl component="fieldset" fullWidth>
                <RadioGroup 
                  value={ans?.selected_choice_id || ''} 
                  onChange={(e) => handleChoiceChange(q.id, parseInt(e.target.value))}
                >
                  {q.choices.map(c => (
                    <FormControlLabel 
                      key={c.id} 
                      value={c.id} 
                      control={<Radio />} 
                      label={c.choice_text}
                      disabled={!!results}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {q.question_type === 'OPEN' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Votre réponse détaillée..."
                value={ans?.open_answer_text || ''}
                onChange={(e) => handleOpenAnswerChange(q.id, e.target.value)}
                onBlur={() => handleOpenAnswerBlur(q.id)}
                disabled={!!results}
              />
            )}
            
            {result && (
              <Box sx={{ mt: 3, p: 2, bgcolor: result.is_correct ? 'success.50' : 'error.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color={result.is_correct ? 'success.main' : 'error.main'} fontWeight="bold">
                  {result.is_correct ? 'Correct' : 'Incorrect'}
                </Typography>
                
                {q.question_type === 'OPEN' && (
                  <Box mt={1}>
                    <Typography variant="body2" fontWeight="bold">Correction de l'IA :</Typography>
                    <Typography variant="body2" paragraph>{result.ai_correction}</Typography>
                    <Typography variant="body2" color="text.secondary">Réponse attendue : {result.expected_answer}</Typography>
                  </Box>
                )}
                
                {q.question_type !== 'OPEN' && (
                  <Box mt={1}>
                    <Typography variant="body2">{result.explanation}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        );
      })}

      {!results && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 8 }}>
          <Button variant="outlined" onClick={() => navigate('/quizzes')}>
            Retour (Sauvegardé automatiquement)
          </Button>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? 'Correction par l\'IA...' : 'Soumettre le Quiz'}
          </Button>
        </Box>
      )}
      
      {results && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 8 }}>
          <Button variant="contained" onClick={() => navigate('/quizzes')}>
            Retour aux Quiz
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QuizAttemptPage;
