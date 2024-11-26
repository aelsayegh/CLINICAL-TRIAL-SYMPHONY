import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TransformedDatasetsList = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [transformations, setTransformations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [activating, setActivating] = useState(false);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/datasets');
      if (response.data.success) {
        setDatasets(response.data.datasets);
      }
    } catch (err) {
      setError('Failed to fetch transformed datasets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransformations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transformations');
      if (response.data.success) {
        setTransformations(response.data.transformations);
      }
    } catch (error) {
      console.error('Error fetching transformations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
    fetchTransformations();
  }, []);

  const handleActivate = async (transformationId) => {
    try {
      setLoading(true);
      console.log('Activating transformation:', transformationId);
      
      const activateData = {
        snapshotId: '6744ebb949cdb9cd94007d2b',
        name: 'Activated Transformation',
        description: 'Activated from the UI',
        status: 'active',
        type: 'rename',
        config: {
          sourceColumn: 'subjectId',
          newName: 'test'
        }
      };
      
      console.log('Activation payload:', activateData);
      
      const response = await api.post(
        `/api/transformations/${transformationId}/activate`, 
        activateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        alert('Transformation activated successfully');
        await fetchTransformations();
      } else {
        throw new Error(response.data.message || 'Activation failed');
      }
    } catch (error) {
      console.error('Activation error:', error.response?.data || error);
      alert('Failed to activate: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dataset) => {
    navigate(`/transformations/edit/${dataset._id}`, {
      state: {
        datasetId: dataset.sourceDataset,
        transformationId: dataset._id,
        isEdit: true
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedDataset) return;

    try {
      await api.delete(`/api/transformations/${selectedDataset._id}`);
      await fetchDatasets();
      setDeleteDialogOpen(false);
      setSelectedDataset(null);
    } catch (err) {
      console.error('Failed to delete dataset:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Source Dataset</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map((dataset) => (
              <TableRow key={dataset._id}>
                <TableCell>{dataset.name}</TableCell>
                <TableCell>{dataset.sourceDatasetName}</TableCell>
                <TableCell>
                  <Chip
                    label={dataset.status}
                    color={dataset.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {new Date(dataset.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {dataset.status === 'draft' && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(dataset)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Activate">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleActivate(dataset._id)}
                            disabled={activating}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedDataset(dataset);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Transformed Dataset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDataset?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransformedDatasetsList; 