import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  CircularProgress, Alert, LinearProgress, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  MoreVert as MoreIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  OpenInNew as OpenIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Quiz as QuizIcon,
  AutoStories as SummaryIcon
} from '@mui/icons-material';
import { documentService } from '../../services/document.service';
import { Document } from '../../types/document';
import { parseApiError } from '../../utils/errorParser';
import { useAuth } from '../../hooks/useAuth';

const StatusChip = ({ status }: { status: Document['status'] }) => {
  const config = {
    UPLOADED: { color: 'info' as const, label: 'Transféré' },
    PROCESSING: { color: 'warning' as const, label: 'En cours...' },
    READY: { color: 'success' as const, label: 'Prêt' },
    FAILED: { color: 'error' as const, label: 'Échec' },
  };
  const { color, label } = config[status] || config.FAILED;
  
  return <Chip label={label} color={color} size="small" sx={{ fontWeight: 'bold' }} />;
};

const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rename/Delete State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Summary State
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    
    // Polling si un document est en processing
    const hasProcessing = documents.some(d => d.status === 'PROCESSING' || d.status === 'UPLOADED');
    if (hasProcessing) {
      const interval = setInterval(fetchDocuments, 5000);
      return () => clearInterval(interval);
    }
  }, [documents]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setUploadError("Seuls les fichiers PDF sont autorisés.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50 MB
        setUploadError("La taille du fichier ne doit pas dépasser 50 MB.");
        return;
      }
      setUploadFile(file);
      setUploadTitle(file.name.replace('.pdf', ''));
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) return;
    setUploading(true);
    setUploadError(null);
    try {
      await documentService.uploadDocument(uploadTitle, uploadFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setUploadProgress(percentCompleted);
      });
      setSuccessMsg("Document importé avec succès. Traitement en cours...");
      setUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchDocuments();
    } catch (err) {
      setUploadError(parseApiError(err));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, doc: Document) => {
    setAnchorEl(event.currentTarget);
    setActiveDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveDoc(null);
  };

  const handleDelete = async () => {
    if (!activeDoc) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.")) {
      try {
        await documentService.deleteDocument(activeDoc.id);
        setSuccessMsg("Document supprimé.");
        fetchDocuments();
      } catch (err) {
        setError(parseApiError(err));
      }
    }
    handleMenuClose();
  };

  const handleRenameSubmit = async () => {
    if (!activeDoc || !newTitle) return;
    try {
      await documentService.renameDocument(activeDoc.id, newTitle);
      setSuccessMsg("Document renommé.");
      fetchDocuments();
      setRenameOpen(false);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleGenerateSummary = async (type: 'summary' | 'study_sheet') => {
    if (!activeDoc) return;
    handleMenuClose();
    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummaryContent('');
    setError(null);
    try {
      const res = await documentService.getSummary(activeDoc.id, type);
      setSummaryContent(res.content);
    } catch (err) {
      setError(parseApiError(err));
      setSummaryOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Quota calculation
  const usedStorageMB = user ? (user.used_storage_bytes / (1024 * 1024)).toFixed(1) : 0;
  const maxStorageMB = user ? (user.max_storage_bytes / (1024 * 1024)).toFixed(0) : 0;
  const storagePercentage = user && user.max_storage_bytes > 0 ? (user.used_storage_bytes / user.max_storage_bytes) * 100 : 0;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Mes Documents</Typography>
        <Button 
          variant="contained" 
          startIcon={<UploadIcon />} 
          onClick={() => setUploadOpen(true)}
          disabled={user ? user.documents_count >= user.max_documents : true}
        >
          Nouveau Document
        </Button>
      </Box>

      {user && (
        <Paper sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              Quota: {user.documents_count} / {user.max_documents} documents
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Stockage: {usedStorageMB} / {maxStorageMB} MB
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={storagePercentage > 100 ? 100 : storagePercentage} sx={{ height: 8, borderRadius: 4 }} />
        </Paper>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Date d'ajout</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">Aucun document trouvé.</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setUploadOpen(true)}>
                      Ajouter un document
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">{doc.title}</Typography>
                    </TableCell>
                    <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell><StatusChip status={doc.status} /></TableCell>
                    <TableCell align="right">
                      {doc.status === 'READY' && (
                        <Tooltip title="Discuter avec l'IA">
                          <IconButton size="small" color="primary">
                            <ChatIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, doc)}>
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Menu d'actions du document */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (activeDoc) window.open(activeDoc.file, '_blank');
          handleMenuClose();
        }}>
          <ListItemIcon><OpenIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ouvrir le PDF</ListItemText>
        </MenuItem>
        
        {activeDoc?.status === 'READY' && [
          <MenuItem key="chat" onClick={handleMenuClose}>
            <ListItemIcon><ChatIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Tuteur IA</ListItemText>
          </MenuItem>,
          <MenuItem key="quiz" onClick={handleMenuClose}>
            <ListItemIcon><QuizIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Générer Quiz</ListItemText>
          </MenuItem>,
          <MenuItem key="summary" onClick={() => handleGenerateSummary('summary')}>
            <ListItemIcon><SummaryIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Générer Résumé</ListItemText>
          </MenuItem>,
          <MenuItem key="fiche" onClick={() => handleGenerateSummary('study_sheet')}>
            <ListItemIcon><SummaryIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Générer Fiche de Révision</ListItemText>
          </MenuItem>
        ]}
        
        <MenuItem onClick={() => {
          setNewTitle(activeDoc?.title || '');
          setRenameOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Renommer</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog d'Upload */}
      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un document PDF</DialogTitle>
        <DialogContent>
          {uploadError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{uploadError}</Alert>}
          
          <Box 
            sx={{ 
              border: '2px dashed', 
              borderColor: 'grey.400', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              bgcolor: 'grey.50',
              cursor: 'pointer',
              mb: 2,
              mt: 1
            }}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="application/pdf" 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileChange}
              disabled={uploading}
            />
            <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body1">
              {uploadFile ? uploadFile.name : "Cliquez ou glissez-déposez un fichier PDF ici"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (Max: 50MB, Format: PDF uniquement)
            </Typography>
          </Box>
          
          {uploadFile && (
            <TextField
              fullWidth
              label="Titre du document"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              disabled={uploading}
              margin="normal"
            />
          )}

          {uploading && (
            <Box mt={2}>
              <Typography variant="body2" mb={1}>Importation en cours... {uploadProgress}%</Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading} color="inherit">Annuler</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!uploadFile || !uploadTitle || uploading} 
            variant="contained"
          >
            {uploading ? 'Patientez...' : 'Importer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Renommer */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Renommer le document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nouveau titre"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)} color="inherit">Annuler</Button>
          <Button onClick={handleRenameSubmit} variant="contained" disabled={!newTitle.trim()}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Summary */}
      <Dialog open={summaryOpen} onClose={() => setSummaryOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Résumé / Fiche de Révision</DialogTitle>
        <DialogContent dividers>
          {summaryLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Génération par l'IA en cours...</Typography>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {summaryContent}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSummaryOpen(false)} variant="contained">Fermer</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DocumentsPage;
