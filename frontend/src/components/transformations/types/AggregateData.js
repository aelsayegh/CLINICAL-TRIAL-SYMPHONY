import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Grid,
  Chip,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const aggregateFunctions = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'count', label: 'Count' }
];

const AggregateData = ({ config, onChange, columns }) => {
  const handleAddAggregation = () => {
    const newAggregations = [...(config.aggregations || []), { column: '', function: '' }];
    onChange({ ...config, aggregations: newAggregations });
  };

  const handleRemoveAggregation = (index) => {
    const newAggregations = config.aggregations.filter((_, i) => i !== index);
    onChange({ ...config, aggregations: newAggregations });
  };

  const handleUpdateAggregation = (index, field, value) => {
    const newAggregations = [...(config.aggregations || [])];
    newAggregations[index] = { ...newAggregations[index], [field]: value };
    onChange({ ...config, aggregations: newAggregations });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Group By Columns
          </Typography>
          <FormControl fullWidth>
            <Select
              multiple
              size="small"
              value={config.groupBy || []}
              onChange={(e) => onChange({ ...config, groupBy: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {columns.map((column) => (
                <MenuItem key={column} value={column}>
                  {column}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              Aggregations
            </Typography>
            <IconButton size="small" onClick={handleAddAggregation}>
              <AddIcon />
            </IconButton>
          </Box>

          {(config.aggregations || []).map((agg, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <FormControl fullWidth size="small">
                  <Select
                    value={agg.column || ''}
                    onChange={(e) => handleUpdateAggregation(index, 'column', e.target.value)}
                    placeholder="Select column"
                  >
                    {columns.map((column) => (
                      <MenuItem key={column} value={column}>
                        {column}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={5}>
                <FormControl fullWidth size="small">
                  <Select
                    value={agg.function || ''}
                    onChange={(e) => handleUpdateAggregation(index, 'function', e.target.value)}
                    placeholder="Select function"
                  >
                    {aggregateFunctions.map((func) => (
                      <MenuItem key={func.value} value={func.value}>
                        {func.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <IconButton size="small" onClick={() => handleRemoveAggregation(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AggregateData; 