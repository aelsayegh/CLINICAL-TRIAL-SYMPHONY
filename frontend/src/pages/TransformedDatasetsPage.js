import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert
} from '@mui/material';
import TransformedDatasetsList from '../components/transformations/TransformedDatasetsList';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const TransformedDatasetsPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Transformed Datasets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/data-management/transformation')}
        >
          New Transformation
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage your transformed datasets here. Activate them to make them available in the Datasets tab.
      </Alert>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TransformedDatasetsList />
      </Paper>
    </Box>
  );
};

export default TransformedDatasetsPage; 