import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, TextField, IconButton, Avatar, CircularProgress } from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Person as UserIcon } from '@mui/icons-material';
import api from '../api/axios';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your AI assistant. Ask me anything about your documents.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat/ask/', { question: userMessage.content });
      setMessages((prev) => [...prev, { role: 'bot', content: response.data.answer || response.data.response }]);
    } catch (error) {
      console.error('Failed to get answer', error);
      setMessages((prev) => [...prev, { role: 'bot', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        AI Assistant
      </Typography>
      
      <Paper elevation={0} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 4, border: '1px solid #334155' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 2 }}>
              {msg.role === 'bot' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
              )}
              
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: msg.role === 'user' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#fff' : 'text.primary',
                  border: msg.role === 'bot' ? '1px solid #334155' : 'none',
                  borderTopRightRadius: msg.role === 'user' ? 4 : 12,
                  borderTopLeftRadius: msg.role === 'bot' ? 4 : 12,
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
              </Box>
              
              {msg.role === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                  <UserIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                <BotIcon fontSize="small" />
              </Avatar>
              <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderTopLeftRadius: 4 }}>
                <CircularProgress size={20} color="primary" />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Box sx={{ p: 2, borderTop: '1px solid #334155', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <Box sx={{ display: 'flex', gap: 1, backgroundColor: 'background.paper', borderRadius: 8, p: 0.5, border: '1px solid #334155' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask a question about your documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                },
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{ 
                bgcolor: input.trim() && !loading ? 'primary.main' : 'transparent',
                color: input.trim() && !loading ? '#fff' : 'inherit',
                '&:hover': { bgcolor: 'primary.dark' },
                borderRadius: '50%',
                width: 48,
                height: 48,
                m: 0.5
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;
