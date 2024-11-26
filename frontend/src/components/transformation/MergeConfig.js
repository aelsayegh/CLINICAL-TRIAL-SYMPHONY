import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
  IconButton,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  CompareArrows,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const MergeConfig = ({ selectedDatasets, sourceDatasets, onConfigChange }) => {
  const [leftDataset, setLeftDataset] = useState('');
  const [rightDataset, setRightDataset] = useState('');
  const [joinConditions, setJoinConditions] = useState([
    { leftColumn: '', rightColumn: '' }
  ]);
  const [mergeType, setMergeType] = useState('inner');

  // Get the actual dataset objects
  const leftDatasetObj = sourceDatasets.find(d => d.id === leftDataset);
  const rightDatasetObj = sourceDatasets.find(d => d.id === rightDataset);

  const handleAddJoinCondition = () => {
    setJoinConditions([...joinConditions, { leftColumn: '', rightColumn: '' }]);
  };

  const handleRemoveJoinCondition = (index) => {
    const newConditions = joinConditions.filter((_, i) => i !== index);
    setJoinConditions(newConditions);
  };

  const updateJoinCondition = (index, side, value) => {
    const newConditions = [...joinConditions];
    newConditions[index] = {
      ...newConditions[index],
      [side]: value
    };
    setJoinConditions(newConditions);
  };

  // Update parent component whenever configuration changes
  useEffect(() => {
    onConfigChange({
      mergeType,
      leftDataset,
      rightDataset,
      joinConditions
    });
  }, [mergeType, leftDataset, rightDataset, joinConditions]);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Join Type Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Join Type</InputLabel>
        <Select
          value={mergeType}
          onChange={(e) => setMergeType(e.target.value)}
          label="Join Type"
        >
          <MenuItem value="inner">Inner Join</MenuItem>
          <MenuItem value="left">Left Join</MenuItem>
          <MenuItem value="right">Right Join</MenuItem>
          <MenuItem value="outer">Full Outer Join</MenuItem>
        </Select>
      </FormControl>

      {/* Dataset Selection */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Left Dataset
            </Typography>
            <FormControl fullWidth>
              <Select
                value={leftDataset}
                onChange={(e) => setLeftDataset(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Select Dataset</MenuItem>
                {selectedDatasets.map(id => {
                  const dataset = sourceDatasets.find(d => d.id === id);
                  return (
                    <MenuItem key={id} value={id}>
                      {dataset.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {leftDatasetObj && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption">
                  {leftDatasetObj.totalRows.toLocaleString()} rows
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {leftDatasetObj.headers.slice(0, 5).map(header => (
                    <Chip 
                      key={header} 
                      label={header} 
                      size="small" 
                      sx={{ m: 0.5 }} 
                    />
                  ))}
                  {leftDatasetObj.headers.length > 5 && (
                    <Chip 
                      label={`+${leftDatasetObj.headers.length - 5} more`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ m: 0.5 }} 
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CompareArrows sx={{ transform: 'rotate(90deg)' }} />
        </Grid>

        <Grid item xs={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Right Dataset
            </Typography>
            <FormControl fullWidth>
              <Select
                value={rightDataset}
                onChange={(e) => setRightDataset(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Select Dataset</MenuItem>
                {selectedDatasets.map(id => {
                  const dataset = sourceDatasets.find(d => d.id === id);
                  return (
                    <MenuItem key={id} value={id}>
                      {dataset.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {rightDatasetObj && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption">
                  {rightDatasetObj.totalRows.toLocaleString()} rows
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {rightDatasetObj.headers.slice(0, 5).map(header => (
                    <Chip 
                      key={header} 
                      label={header} 
                      size="small" 
                      sx={{ m: 0.5 }} 
                    />
                  ))}
                  {rightDatasetObj.headers.length > 5 && (
                    <Chip 
                      label={`+${rightDatasetObj.headers.length - 5} more`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ m: 0.5 }} 
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Join Conditions */}
      <Typography variant="subtitle1" gutterBottom>
        Join Conditions
      </Typography>
      
      {joinConditions.map((condition, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <InputLabel>Left Column</InputLabel>
              <Select
                value={condition.leftColumn}
                onChange={(e) => updateJoinCondition(index, 'leftColumn', e.target.value)}
                label="Left Column"
                disabled={!leftDataset}
              >
                {leftDatasetObj?.headers.map(header => (
                  <MenuItem key={header} value={header}>{header}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>=</Typography>
          </Grid>

          <Grid item xs={5} sx={{ display: 'flex', gap: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Right Column</InputLabel>
              <Select
                value={condition.rightColumn}
                onChange={(e) => updateJoinCondition(index, 'rightColumn', e.target.value)}
                label="Right Column"
                disabled={!rightDataset}
              >
                {rightDatasetObj?.headers.map(header => (
                  <MenuItem key={header} value={header}>{header}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {index > 0 && (
              <IconButton 
                color="error" 
                onClick={() => handleRemoveJoinCondition(index)}
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddJoinCondition}
        variant="outlined"
        sx={{ mt: 1 }}
      >
        Add Join Condition
      </Button>

      {/* Future Harmonization Notice */}
      <Alert severity="info" sx={{ mt: 3 }}>
        Future Update: Automatic harmonization for patient IDs, site IDs, and visit IDs across clinical study datasets will be available soon.
      </Alert>
    </Box>
  );
};

export default MergeConfig; 