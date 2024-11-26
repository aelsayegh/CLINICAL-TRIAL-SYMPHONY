import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const SnapshotList = () => {
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchSnapshots = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching snapshots...');
      
      const debugResponse = await axios.get(`${API_BASE_URL}/api/snapshots/debug/all`);
      console.log('Debug response:', debugResponse.data);
      setDebugInfo(debugResponse.data);

      const response = await axios.get(`${API_BASE_URL}/api/snapshots`);
      console.log('Regular snapshots response:', response.data);
      
      if (response.data.success) {
        setSnapshots(response.data.snapshots || []);
      } else {
        throw new Error('Failed to fetch snapshots');
      }
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      setError(`Failed to fetch snapshots: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const handleCreateSnapshot = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/snapshots`);
      if (response.data.success) {
        navigate(`/data-management/snapshots/${response.data.snapshot._id}`);
      }
    } catch (error) {
      console.error('Error creating snapshot:', error);
      setError('Failed to create snapshot');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Snapshots
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateSnapshot}
            sx={{ borderRadius: 28 }}
          >
            CREATE NEW SNAPSHOT
          </Button>
        </Box>

        {debugInfo && (
          <Box mb={2}>
            <Typography color="textSecondary" variant="body2">
              Debug: Found {debugInfo.count} snapshots in database
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : snapshots.length > 0 ? (
          <List>
            {snapshots.map((snapshot) => (
              <ListItem
                key={snapshot._id}
                button
                onClick={() => navigate(`/data-management/snapshots/${snapshot._id}`)}
                sx={{
                  mb: 1,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        Snapshot {snapshot._id}
                      </Typography>
                      <Chip
                        size="small"
                        label={snapshot.status}
                        color={snapshot.status === 'finalized' ? 'success' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Status: {snapshot.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Datasets: {snapshot.datasetCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(snapshot.createdAt).toLocaleString()}
                      </Typography>
                      {snapshot.finalizedAt && (
                        <Typography variant="body2" color="text.secondary">
                          Finalized: {new Date(snapshot.finalizedAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box>
            <Typography>No snapshots found</Typography>
            {debugInfo && (
              <Typography color="error" variant="body2" mt={1}>
                Note: {debugInfo.count} snapshots exist in database but weren't returned
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SnapshotList; 