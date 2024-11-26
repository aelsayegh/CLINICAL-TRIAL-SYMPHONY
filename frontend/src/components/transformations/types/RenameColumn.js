import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Grid,
  FormHelperText
} from '@mui/material';

const RenameColumn = ({ config, onChange, columns, errors = {} }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.sourceColumn}>
            <Typography variant="caption">Select Column</Typography>
            <Select
              value={config.sourceColumn || ''}
              onChange={(e) => onChange({ 
                ...config, 
                sourceColumn: e.target.value 
              })}
              size="small"
              error={!!errors.sourceColumn}
            >
              {columns.map((column) => (
                <MenuItem key={column} value={column}>
                  {column}
                </MenuItem>
              ))}
            </Select>
            {errors.sourceColumn && (
              <FormHelperText error>{errors.sourceColumn}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.newName}>
            <Typography variant="caption">New Name</Typography>
            <TextField
              size="small"
              value={config.newName || ''}
              onChange={(e) => onChange({ 
                ...config, 
                newName: e.target.value 
              })}
              placeholder="Enter new column name"
              error={!!errors.newName}
              helperText={errors.newName}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RenameColumn; 