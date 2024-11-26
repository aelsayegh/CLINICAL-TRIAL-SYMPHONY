import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const API_BASE_URL = 'http://localhost:5001';

const SnapshotManagement = () => {
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSnapshot, setNewSnapshot] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/snapshots`);
      setSnapshots(response.data);
    } catch (error) {
      console.error('Error loading snapshots:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/api/snapshots`, newSnapshot);
      setSnapshots([response.data, ...snapshots]);
      setOpenDialog(false);
      setNewSnapshot({ name: '', description: '' });
      navigate(`/data-management/snapshots/${response.data._id}`);
    } catch (error) {
      console.error('Error creating snapshot:', error);
      setError(error.response?.data?.error || error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSnapshot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenSnapshot = (snapshotId) => {
    navigate(`/data-management/snapshots/${snapshotId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Add Snapshot Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Snapshots</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={loading}
        >
          Create Snapshot
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && snapshots.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No snapshots found. Click the "Create Snapshot" button to get started.
          </Typography>
        </Box>
      )}

      {/* Updated Snapshots List */}
      {!loading && !error && snapshots.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {snapshots.map((snapshot) => (
            <Card key={snapshot._id}>
              <CardContent>
                <Typography variant="h6">{snapshot.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {snapshot.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Created: {new Date(snapshot.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Status: {snapshot.status}
                </Typography>
                {snapshot.fileCount > 0 && (
                  <Typography variant="caption" display="block">
                    Files: {snapshot.fileCount}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => handleOpenSnapshot(snapshot._id)}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Snapshot Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Snapshot</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Snapshot Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSnapshot.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newSnapshot.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSnapshot}
            variant="contained"
            disabled={!newSnapshot.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SnapshotManagement; 