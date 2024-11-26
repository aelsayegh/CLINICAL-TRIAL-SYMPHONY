import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RenameColumn from './types/RenameColumn';
import FilterData from './types/FilterData';
import AggregateData from './types/AggregateData';
import SortData from './types/SortData';

const availableTransformations = [
  { 
    id: 'rename', 
    name: 'Rename Column', 
    description: 'Change column names',
    component: RenameColumn
  },
  { 
    id: 'filter', 
    name: 'Filter Data', 
    description: 'Filter rows based on conditions',
    component: FilterData
  },
  {
    id: 'aggregate',
    name: 'Aggregate Data',
    description: 'Group and aggregate data',
    component: AggregateData
  },
  {
    id: 'sort',
    name: 'Sort Data',
    description: 'Sort data by columns',
    component: SortData
  }
];

const TransformationBuilder = ({ dataset, transformations, onTransformationsChange }) => {
  const [expandedTransformation, setExpandedTransformation] = useState(null);

  const handleAddTransformation = (transformation) => {
    const newTransformation = {
      id: Date.now(),
      type: transformation.id,
      name: transformation.name,
      description: transformation.description,
      component: transformation.component,
      config: {}
    };
    onTransformationsChange([...transformations, newTransformation]);
    setExpandedTransformation(newTransformation.id);
  };

  const handleRemoveTransformation = (index) => {
    const updatedTransformations = transformations.filter((_, i) => i !== index);
    onTransformationsChange(updatedTransformations);
  };

  const handleUpdateTransformation = (index, newConfig) => {
    const updatedTransformations = [...transformations];
    updatedTransformations[index] = {
      ...updatedTransformations[index],
      config: newConfig
    };
    onTransformationsChange(updatedTransformations);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Transformations
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {availableTransformations.map((transformation) => (
          <Grid item xs={12} sm={6} md={3} key={transformation.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => handleAddTransformation(transformation)}
            >
              <CardContent>
                <Typography variant="subtitle1">{transformation.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {transformation.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {transformations.length > 0 && (
        <Typography variant="h6" gutterBottom>
          Applied Transformations
        </Typography>
      )}

      {transformations.map((transform, index) => (
        <Card key={transform.id} sx={{ mb: 2 }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="subtitle1">
              {index + 1}. {transform.name}
            </Typography>
            <Box>
              <IconButton
                onClick={() => setExpandedTransformation(
                  expandedTransformation === transform.id ? null : transform.id
                )}
                sx={{
                  transform: expandedTransformation === transform.id ? 
                    'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s'
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
              <IconButton 
                onClick={() => handleRemoveTransformation(index)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Collapse in={expandedTransformation === transform.id}>
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              {transform.component && (
                <transform.component
                  config={transform.config}
                  onChange={(newConfig) => handleUpdateTransformation(index, newConfig)}
                  columns={dataset?.headers || []}
                />
              )}
            </Box>
          </Collapse>
        </Card>
      ))}
    </Box>
  );
};

export default TransformationBuilder; 