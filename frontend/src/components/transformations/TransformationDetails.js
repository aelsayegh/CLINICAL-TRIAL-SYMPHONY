import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const TransformationDetails = ({ datasetId, open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!datasetId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/transformations/${datasetId}`
        );
        
        if (response.data.success) {
          setDetails(response.data.dataset);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch transformation details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [datasetId]);

  const renderTransformationStep = (transformation, index) => {
    const getStepDescription = () => {
      switch (transformation.type) {
        case 'rename':
          return `Rename column "${transformation.config.sourceColumn}" to "${transformation.config.newName}"`;
        case 'filter':
          return `Filter where ${transformation.config.column} ${transformation.config.operator} ${transformation.config.value}`;
        case 'aggregate':
          return `Group by ${transformation.config.groupBy.join(', ')} and apply ${transformation.config.aggregations.length} aggregation(s)`;
        case 'sort':
          return `Sort by ${transformation.config.sortRules.map(rule => 
            `${rule.column} (${rule.direction})`).join(', ')}`;
        default:
          return 'Unknown transformation type';
      }
    };

    return (
      <Box key={index} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="primary">
          Step {index + 1}: {transformation.type.charAt(0).toUpperCase() + transformation.type.slice(1)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {getStepDescription()}
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Transformation Details
        {details && (
          <Chip
            label={details.status}
            color={details.status === 'active' ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : details && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography><strong>Name:</strong> {details.name}</Typography>
                  <Typography><strong>Source Dataset:</strong> {details.sourceDataset.name}</Typography>
                  <Typography><strong>Created:</strong> {new Date(details.createdAt).toLocaleString()}</Typography>
                  <Typography><strong>Updated:</strong> {new Date(details.updatedAt).toLocaleString()}</Typography>
                  <Typography><strong>Total Rows:</strong> {details.totalRows}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Transformation Steps
                  </Typography>
                  {details.transformations.map((transform, index) => 
                    renderTransformationStep(transform, index)
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Data Preview
              </Typography>
              <Box sx={{ height: 400 }}>
                <DataGrid
                  rows={details.previewData}
                  columns={details.headers.map(header => ({
                    field: header,
                    headerName: header,
                    width: 150
                  }))}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransformationDetails; 