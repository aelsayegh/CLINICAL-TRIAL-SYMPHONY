import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleCleanup = async () => {
    if (!window.confirm('WARNING: This will delete ALL snapshots and datasets. Are you sure you want to continue?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await axios.post(`${API_BASE_URL}/api/admin/cleanup`);
      
      if (response.data.success) {
        setMessage(`Successfully cleaned up database. Deleted ${response.data.deletedCounts.datasets} datasets and ${response.data.deletedCounts.snapshots} snapshots.`);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      setError(error.response?.data?.message || 'Error performing cleanup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Admin Panel
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Database Cleanup
          </Typography>
          <Typography color="error" paragraph>
            Warning: This action cannot be undone!
          </Typography>
          
          <Button
            variant="contained"
            color="error"
            onClick={handleCleanup}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Clean Database'
            )}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPanel; 