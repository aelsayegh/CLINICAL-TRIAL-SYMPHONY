import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid
} from '@mui/material';

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'between', label: 'Between' }
];

const FilterData = ({ config, onChange, columns }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="caption">Column</Typography>
            <Select
              size="small"
              value={config.column || ''}
              onChange={(e) => onChange({ 
                ...config, 
                column: e.target.value 
              })}
            >
              {columns.map((column) => (
                <MenuItem key={column} value={column}>
                  {column}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="caption">Operator</Typography>
            <Select
              size="small"
              value={config.operator || ''}
              onChange={(e) => onChange({ 
                ...config, 
                operator: e.target.value 
              })}
            >
              {operators.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Typography variant="caption">Value</Typography>
            <TextField
              size="small"
              value={config.value || ''}
              onChange={(e) => onChange({ 
                ...config, 
                value: e.target.value 
              })}
              placeholder="Enter filter value"
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterData; 