import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const StatisticsPanel = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const {
    columnStats,
    totalRows,
    missingValues,
    outliers,
    dataTypes,
    completeness
  } = data;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Quality Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Overview Stats */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Overview
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Total Rows"
                  secondary={totalRows}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Total Columns"
                  secondary={Object.keys(columnStats).length}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Overall Completeness"
                  secondary={`${(completeness * 100).toFixed(1)}%`}
                />
                <Chip 
                  icon={completeness > 0.9 ? <CheckCircleIcon /> : <WarningIcon />}
                  label={completeness > 0.9 ? "Good" : "Needs Review"}
                  color={completeness > 0.9 ? "success" : "warning"}
                  size="small"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Column Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Column Analysis
            </Typography>
            <List dense>
              {Object.entries(columnStats).map(([column, stats]) => (
                <ListItem key={column}>
                  <ListItemText
                    primary={column}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span">
                          Type: {dataTypes[column]} | 
                          Missing: {missingValues[column] || 0} | 
                          Outliers: {outliers[column]?.length || 0}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {missingValues[column] > 0 && (
                    <Chip
                      icon={<WarningIcon />}
                      label="Missing Values"
                      color="warning"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {outliers[column]?.length > 0 && (
                    <Chip
                      icon={<ErrorIcon />}
                      label="Outliers"
                      color="error"
                      size="small"
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatisticsPanel; 