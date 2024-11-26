import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const SortData = ({ config, onChange, columns }) => {
  const handleAddSort = () => {
    const newSortRules = [...(config.sortRules || []), { column: '', direction: 'asc' }];
    onChange({ ...config, sortRules: newSortRules });
  };

  const handleRemoveSort = (index) => {
    const newSortRules = config.sortRules.filter((_, i) => i !== index);
    onChange({ ...config, sortRules: newSortRules });
  };

  const handleUpdateSort = (index, field, value) => {
    const newSortRules = [...(config.sortRules || [])];
    newSortRules[index] = { ...newSortRules[index], [field]: value };
    onChange({ ...config, sortRules: newSortRules });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">
          Sort Rules
        </Typography>
        <IconButton size="small" onClick={handleAddSort}>
          <AddIcon />
        </IconButton>
      </Box>

      {(config.sortRules || []).map((rule, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
          <Grid item xs={1}>
            <DragIndicatorIcon color="action" />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <Select
                value={rule.column || ''}
                onChange={(e) => handleUpdateSort(index, 'column', e.target.value)}
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
          <Grid item xs={3}>
            <FormControl fullWidth size="small">
              <Select
                value={rule.direction || 'asc'}
                onChange={(e) => handleUpdateSort(index, 'direction', e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <IconButton size="small" onClick={() => handleRemoveSort(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default SortData; 