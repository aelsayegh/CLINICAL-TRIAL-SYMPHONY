import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

const DatasetSelector = ({ selectedDataset, onSelect }) => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/datasets`);
        
        console.log('Fetched datasets:', response.data);
        
        if (response.data && Array.isArray(response.data.datasets)) {
          setDatasets(response.data.datasets);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching datasets:', err);
        setError(`Failed to fetch datasets: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a Dataset to Transform
      </Typography>
      {datasets.length === 0 ? (
        <Alert severity="info">No datasets available</Alert>
      ) : (
        <Grid container spacing={3}>
          {datasets.map((dataset) => (
            <Grid item xs={12} md={6} lg={4} key={dataset._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedDataset?._id === dataset._id ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
                onClick={() => onSelect({
                  ...dataset,
                  id: dataset._id
                })}
              >
                <CardContent>
                  <Typography variant="h6">{dataset.name}</Typography>
                  <Typography color="textSecondary">
                    Rows: {dataset.data?.length || 'N/A'}
                  </Typography>
                  <Typography color="textSecondary">
                    Columns: {dataset.headers?.length || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Last Updated: {new Date(dataset.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DatasetSelector; 