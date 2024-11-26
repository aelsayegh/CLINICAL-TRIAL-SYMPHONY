import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Typography
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const CHUNK_SIZE = 1000; // Number of rows per chunk

const FileUpload = ({ snapshotId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const data = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(cell => cell.trim());
              const rowData = {};
              headers.forEach((header, index) => {
                rowData[header] = values[index]?.toString() || '';
              });
              return rowData;
            });

          console.log('Processing file:', {
            name: file.name,
            headers: headers,
            totalRows: data.length
          });

          // Create dataset with headers
          const createResponse = await axios.post(`${API_BASE_URL}/api/datasets`, {
            name: file.name,
            headers: headers,
            snapshotId: snapshotId,
            headerCount: headers.length,
            dataCount: data.length
          });

          console.log('Dataset creation response:', createResponse.data);

          if (!createResponse.data.success) {
            throw new Error(createResponse.data.message || 'Failed to create dataset');
          }

          // Get datasetId directly from response
          const datasetId = createResponse.data.datasetId;
          
          if (!datasetId) {
            console.error('Dataset creation response:', createResponse.data);
            throw new Error('Dataset ID not found in response');
          }

          console.log('Uploading data for dataset:', datasetId);
          setProgress(25);

          // Upload the data
          const dataResponse = await axios.post(`${API_BASE_URL}/api/datasets/${datasetId}/data`, {
            data: data
          });

          console.log('Data upload response:', dataResponse.data);

          if (!dataResponse.data.success) {
            throw new Error(dataResponse.data.message || 'Failed to upload data');
          }

          setProgress(100);
          console.log('Upload completed successfully');
          
          if (onUploadComplete) {
            onUploadComplete();
          }
        } catch (error) {
          console.error('Upload error:', error);
          setError(error.response?.data?.message || error.message || 'Error uploading file');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = (error) => {
        console.error('File reading error:', error);
        setError('Error reading file');
        setUploading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('File handling error:', error);
      setError('Error handling file');
      setUploading(false);
    }
  };

  return (
    <Box>
      <input
        accept=".csv"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="raised-button-file">
        <Button
          variant="contained"
          component="span"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </Button>
      </label>

      {uploading && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="center">
            {Math.round(progress)}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
