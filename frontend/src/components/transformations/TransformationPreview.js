import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Box, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Typography
} from '@mui/material';

const TransformationPreview = ({ transformations }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  
  // Get datasetId from the first dataset in the list
  const [datasetId, setDatasetId] = useState(null);

  useEffect(() => {
    // Fetch the active dataset ID
    const fetchDatasetId = async () => {
      try {
        const response = await api.get('/datasets');
        if (response.data.success && response.data.datasets?.length > 0) {
          setDatasetId(response.data.datasets[0].id);
        }
      } catch (err) {
        console.error('Error fetching dataset ID:', err);
      }
    };
    
    fetchDatasetId();
  }, []);

  const fetchPreview = async () => {
    if (!datasetId || !transformations?.length) {
      console.log('Missing required data:', { datasetId, transformations });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        datasetId,
        transformations
      };
      
      console.log('Sending preview request:', payload);

      const response = await api.post('/transformations/preview', payload);
      
      if (response.data.success && response.data.preview) {
        setPreviewData(response.data.preview);
      }
    } catch (err) {
      console.error('Preview error:', err);
      setError(err.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId && transformations?.length) {
      fetchPreview();
    }
  }, [datasetId, transformations]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!previewData) {
    return (
      <Box p={2}>
        <Typography>
          Waiting for preview data...
          {!datasetId && ' (No dataset selected)'}
          {!transformations?.length && ' (No transformations added)'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Preview Results
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {previewData.headers.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {previewData.headers.map((header, colIndex) => (
                  <TableCell key={colIndex}>
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransformationPreview; 