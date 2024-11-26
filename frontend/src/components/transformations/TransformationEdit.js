import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
// Import Material-UI components
import { TextField, Button } from '@mui/material';
import Box from '@mui/material/Box';

const TransformationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transformation, setTransformation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransformation = async () => {
    try {
      setLoading(true);
      console.log('Fetching transformation:', id);
      const response = await api.get(`/api/transformations/${id}`);
      console.log('Full API Response:', response.data);
      
      if (response.data.success && response.data.dataset) {
        setTransformation({
          ...response.data.dataset,
          snapshotId: '6744ebb949cdb9cd94007d2b'
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load transformation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(event.target);
      const values = Object.fromEntries(formData.entries());
      
      const updateData = {
        ...values,
        snapshotId: '6744ebb949cdb9cd94007d2b',
        type: transformation.type || 'rename',
        config: transformation.config || {
          sourceColumn: values.sourceColumn || 'subjectId',
          newName: values.newName || 'test'
        },
        status: transformation.status || 'pending'
      };
      
      console.log('Submitting update:', updateData);
      
      const response = await api.put(`/api/transformations/${id}`, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        alert('Transformation updated successfully');
        navigate('/transformations');
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update');
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTransformation();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!transformation) return <div>No transformation found</div>;

  return (
    <Box sx={{ p: 3 }}>
      <h2>Edit Transformation</h2>
      <Box component="form" onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        handleSubmit(values);
      }} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          name="name"
          label="Name"
          defaultValue={transformation.name || ''}
          disabled={loading}
        />
        <TextField
          fullWidth
          margin="normal"
          name="description"
          label="Description"
          defaultValue={transformation.description || ''}
          disabled={loading}
          multiline
          rows={4}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>
      
      {/* Debug output */}
      <Box sx={{ mt: 4 }}>
        <h3>Debug Information</h3>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(transformation, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};

export default TransformationEdit; 