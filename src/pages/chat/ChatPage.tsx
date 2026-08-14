import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, TextField, IconButton, CircularProgress, 
  List, ListItem, ListItemText, Divider, Drawer, Button, 
  MenuItem, Select, FormControl, InputLabel, Avatar, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
  Send as SendIcon, 
  Add as AddIcon, 
  Chat as ChatIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { chatService } from '../../services/chat.service';
import { documentService } from '../../services/document.service';
import { Conversation, Message, Source, FollowUpAction } from '../../types/chat';
import { Document } from '../../types/document';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 300;

const ChatPage = () => {
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [input, setInput] = useState('');
  const [complexity, setComplexity] = useState('normal');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  
  // Streaming state for current response
  const [currentStream, setCurrentStream] = useState('');
  const [currentSources, setCurrentSources] = useState<Source[]>([]);
  const [currentFollowUps, setCurrentFollowUps] = useState<FollowUpAction[]>([]);
  
  const [newConvDocId, setNewConvDocId] = useState<number | ''>('');
  const [newConvTitle, setNewConvTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStream]);

  const fetchInitialData = async () => {
    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
      
      const docs = await documentService.getDocuments();
      setDocuments(docs);
      
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      const conv = await chatService.getConversation(id);
      setMessages(conv.messages || []);
      setCurrentStream('');
      setCurrentSources([]);
      setCurrentFollowUps([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateConversation = async () => {
    if (!newConvTitle) return;
    try {
      const data: any = { title: newConvTitle };
      if (newConvDocId !== '') data.document = newConvDocId;
      
      const conv = await chatService.createConversation(data);
      setConversations([conv, ...conversations]);
      setActiveConvId(conv.id);
      setNewConvTitle('');
      setNewConvDocId('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !activeConvId || isStreaming) return;
    
    const question = input;
    setInput('');
    setCurrentStream('');
    setCurrentSources([]);
    setCurrentFollowUps([]);
    setStreamError(null);
    setIsStreaming(true);
    
    // Add temporary user message
    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: question,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    chatService.streamMessage(
      activeConvId,
      question,
      complexity,
      (token) => {
        setCurrentStream(prev => prev + token);
      },
      (sources) => {
        setCurrentSources(sources);
      },
      (actions) => {
        setCurrentFollowUps(actions);
      },
      () => {
        setIsStreaming(false);
        // Refresh messages completely to get exact state from DB
        fetchMessages(activeConvId);
      },
      (err) => {
        console.error(err);
        setStreamError(err.message || 'Une erreur est survenue lors du streaming.');
        setIsStreaming(false);
      }
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const linkedDoc = activeConv?.document ? documents.find(d => d.id === activeConv?.document) : null;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
      {/* Sidebar: Historique des conversations */}
      <Paper sx={{ width: DRAWER_WIDTH, flexShrink: 0, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', mr: 3 }}>
        <Box p={2} bgcolor="grey.50">
          <Typography variant="h6" fontWeight="bold" gutterBottom>Nouvelle discussion</Typography>
          <TextField 
            fullWidth 
            size="small" 
            placeholder="Titre..." 
            value={newConvTitle}
            onChange={(e) => setNewConvTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Document (Optionnel)</InputLabel>
            <Select
              value={newConvDocId}
              label="Document (Optionnel)"
              onChange={(e) => setNewConvDocId(e.target.value as number | '')}
            >
              <MenuItem value=""><em>Général (Aucun)</em></MenuItem>
              {documents.map(d => (
                <MenuItem key={d.id} value={d.id} disabled={d.status !== 'READY'}>
                  {d.title} {d.status !== 'READY' ? '(En traitement...)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateConversation}
            disabled={!newConvTitle.trim()}
          >
            Créer
          </Button>
        </Box>
        <Divider />
        <List sx={{ overflow: 'auto', flexGrow: 1 }}>
          {conversations.map(conv => (
            <ListItem key={conv.id} disablePadding>
              <Button
                fullWidth
                sx={{ 
                  justifyContent: 'flex-start', 
                  px: 2, 
                  py: 1.5,
                  textTransform: 'none',
                  color: activeConvId === conv.id ? 'primary.main' : 'text.primary',
                  bgcolor: activeConvId === conv.id ? 'primary.light' : 'transparent',
                  borderRadius: 0,
                  borderLeft: activeConvId === conv.id ? '4px solid' : '4px solid transparent',
                  borderColor: 'primary.main'
                }}
                onClick={() => setActiveConvId(conv.id)}
              >
                <ChatIcon sx={{ mr: 2, fontSize: 20 }} />
                <ListItemText 
                  primary={<Typography sx={{ fontWeight: activeConvId === conv.id ? 'bold' : 'normal' }} noWrap>{conv.title}</Typography>} 
                  secondary={conv.document ? 'Lié à un document' : 'Général'}
                />
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Chat Area */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
        {activeConvId ? (
          <>
            {/* Chat Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "grey.50", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">{activeConv?.title}</Typography>
                {linkedDoc && <Typography variant="caption" color="text.secondary">Context: {linkedDoc.title}</Typography>}
              </Box>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Niveau</InputLabel>
                <Select value={complexity} label="Niveau" onChange={(e) => setComplexity(e.target.value)}>
                  <MenuItem value="simple">Simple</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Messages */}
            <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto', bgcolor: '#f8fafc' }}>
              {messages.map((msg, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 3, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>IA</Avatar>
                  )}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      maxWidth: '75%', 
                      borderRadius: 3,
                      bgcolor: msg.role === 'user' ? 'primary.main' : '#fff',
                      color: msg.role === 'user' ? '#fff' : 'text.primary',
                      border: msg.role === 'assistant' ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ 
                      '& p': { m: 0, mb: 1 }, 
                      '& p:last-child': { mb: 0 },
                      '& pre': { bgcolor: 'grey.900', color: '#fff', p: 1, borderRadius: 1, overflowX: 'auto' }
                    }}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </Box>
                  </Paper>
                  {msg.role === 'user' && (
                    <Avatar sx={{ bgcolor: 'secondary.main', ml: 2, width: 32, height: 32 }}>{user?.first_name?.[0]}</Avatar>
                  )}
                </Box>
              ))}

              {/* Streaming Assistant Message */}
              {isStreaming && (
                <Box sx={{ display: 'flex', mb: 3, justifyContent: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>IA</Avatar>
                  <Box sx={{ maxWidth: '75%' }}>
                    {currentSources.length > 0 && (
                      <Accordion elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="caption" color="text.secondary">📚 Sources consultées ({currentSources.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {currentSources.map((s, i) => (
                            <Box key={i} sx={{ mb: 1, p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
                              <Typography variant="caption" fontWeight="bold">Source {s.source || i+1} {s.page ? `(Page ${s.page})` : ''} :</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {s.document_title} - Extrait {s.chunk_index}
                              </Typography>
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    )}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: streamError ? 'error.main' : 'divider' }}>
                      {streamError ? (
                        <Typography color="error" variant="body2">{streamError}</Typography>
                      ) : (
                        <Box sx={{ 
                          '& p': { m: 0, mb: 1 }, 
                          '& p:last-child': { mb: 0 },
                          '& pre': { bgcolor: 'grey.900', color: '#fff', p: 1, borderRadius: 1, overflowX: 'auto' }
                        }}>
                          {currentStream ? <ReactMarkdown>{currentStream}</ReactMarkdown> : <CircularProgress size={20} />}
                        </Box>
                      )}
                    </Paper>
                    
                    {currentFollowUps.length > 0 && (
                      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {currentFollowUps.map((action, i) => (
                          <Button 
                            key={i} 
                            size="small" 
                            variant="outlined" 
                            sx={{ borderRadius: 20, textTransform: 'none' }}
                            onClick={() => {
                              setInput(action.label);
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: "#fff", borderTop: "1px solid", borderColor: "divider" }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Posez votre question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isStreaming}
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || isStreaming}>
                        {isStreaming ? <CircularProgress size={24} /> : <SendIcon />}
                      </IconButton>
                    ),
                    sx: { borderRadius: 3, bgcolor: 'grey.50' }
                  }
                }}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography color="text.secondary">Sélectionnez ou créez une conversation pour commencer</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChatPage;
