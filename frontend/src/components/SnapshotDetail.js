import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUpload from './FileUpload';
import DatasetList from './DatasetList';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const SnapshotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchSnapshotDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/snapshots/${id}`);
      console.log('Snapshot details:', response.data);
      if (response.data.success) {
        setSnapshot(response.data.snapshot);
      }
    } catch (error) {
      console.error('Error fetching snapshot:', error);
      setError('Failed to fetch snapshot details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshotDetails();
  }, [id]);

  const handleUploadComplete = () => {
    console.log('Upload completed, refreshing details');
    fetchSnapshotDetails();
  };

  const handleFinalize = async () => {
    try {
      setFinalizing(true);
      setError(null);
      
      console.log('Attempting to finalize snapshot:', id);
      
      const response = await axios.post(`${API_BASE_URL}/api/snapshots/${id}/finalize`);
      
      console.log('Finalize response:', response.data);
      
      if (response.data.success) {
        setSnapshot(response.data.snapshot);
        setMessage('Snapshot finalized successfully');
        await fetchSnapshotDetails();
        setTimeout(() => {
          navigate('/data-management/datasets');
        }, 2000);
      }
    } catch (error) {
      console.error('Error finalizing snapshot:', error);
      setError('Failed to finalize snapshot: ' + (error.response?.data?.message || error.message));
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/data-management/snapshots')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            Snapshot Details
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : snapshot ? (
          <>
            <Typography variant="h5" gutterBottom>
              Snapshot Details
            </Typography>
            <Typography>Status: {snapshot.status}</Typography>
            <Typography>Created: {new Date(snapshot.createdAt).toLocaleString()}</Typography>
            <Typography mb={3}>Dataset Count: {snapshot.datasetCount || 0}</Typography>

            {snapshot.status !== 'finalized' && (
              <Box mb={3}>
                <FileUpload 
                  snapshotId={id}
                  onUploadComplete={handleUploadComplete}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFinalize}
                  disabled={finalizing}
                  sx={{ mt: 2 }}
                >
                  {finalizing ? 'Finalizing...' : 'Finalize Snapshot'}
                </Button>
              </Box>
            )}

            <DatasetList snapshotId={id} />
          </>
        ) : (
          <Alert severity="error">Snapshot not found</Alert>
        )}
      </Paper>
    </Box>
  );
};

export default SnapshotDetail; 