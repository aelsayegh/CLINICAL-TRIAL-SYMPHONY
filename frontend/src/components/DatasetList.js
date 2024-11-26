import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import SettingsIcon from '@mui/icons-material/Settings';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const DatasetList = ({ snapshotId }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [datasetContent, setDatasetContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [columnStats, setColumnStats] = useState({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const calculateColumnStats = useCallback((rows, headers) => {
    console.log('Calculating stats for:', { rowCount: rows.length, headers });
    
    const stats = {};
    headers.forEach(header => {
      const values = rows
        .map(row => row[header])
        .filter(val => val !== null && val !== undefined && val !== '');
      
      const numericValues = values
        .map(v => typeof v === 'string' ? parseFloat(v.replace(/[^0-9.-]+/g, '')) : v)
        .filter(v => !isNaN(v));

      const isNumeric = numericValues.length > 0 && numericValues.length === values.filter(v => v !== '').length;

      stats[header] = {
        type: isNumeric ? 'number' : 'string',
        distinct: new Set(values).size,
        empty: rows.length - values.length,
        total: rows.length
      };

      if (isNumeric) {
        stats[header].numeric = {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          median: numericValues.sort()[(numericValues.length / 2) | 0]
        };
      }
    });

    console.log('Calculated stats:', stats);
    setColumnStats(stats);
  }, []);

  const fetchDatasets = useCallback(async () => {
    try {
      setLoading(true);
      const url = snapshotId 
        ? `${API_BASE_URL}/api/datasets?snapshotId=${snapshotId}`
        : `${API_BASE_URL}/api/datasets/latest-finalized`;
      
      const response = await axios.get(url);
      if (response.data.success) {
        setDatasets(response.data.datasets || []);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('Failed to fetch datasets');
    } finally {
      setLoading(false);
    }
  }, [snapshotId]);

  const fetchDatasetContent = async (datasetId, currentPage = paginationModel.page, currentPageSize = paginationModel.pageSize) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dataset content:', {
        datasetId,
        page: currentPage,
        pageSize: currentPageSize,
        url: `${API_BASE_URL}/api/datasets/${datasetId}/content`
      });

      const response = await axios.get(
        `${API_BASE_URL}/api/datasets/${datasetId}/content`,
        {
          params: {
            page: currentPage + 1, // Convert 0-based to 1-based page number
            pageSize: currentPageSize
          }
        }
      );

      console.log('Raw API response:', response.data);

      if (response.data.success) {
        const newColumns = response.data.headers.map(header => ({
          field: header,
          headerName: header,
          flex: 1,
          minWidth: 150,
          sortable: true,
          filterable: true
        }));

        // Add unique IDs to rows if they don't have them
        const rows = response.data.rows.map((row, index) => ({
          ...row,
          id: row.id || `${currentPage}-${index}`
        }));

        console.log('Processed rows:', {
          count: rows.length,
          firstRow: rows[0],
          lastRow: rows[rows.length - 1]
        });

        setColumns(newColumns);
        setDatasetContent({
          headers: response.data.headers,
          rows: rows
        });
        setTotalRows(response.data.totalRows);
        calculateColumnStats(rows, response.data.headers);
      } else {
        setError('Failed to fetch dataset content: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching dataset content:', error);
      setError(`Failed to fetch dataset content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handlePaginationModelChange = (newModel) => {
    console.log('Pagination model change:', {
      oldModel: paginationModel,
      newModel: newModel
    });
    
    setPaginationModel(newModel);
    if (selectedDataset) {
      fetchDatasetContent(selectedDataset, newModel.page, newModel.pageSize);
    }
  };

  const togglePinColumn = (field) => {
    setPinnedColumns(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Dataset</InputLabel>
          <Select
            value={selectedDataset}
            onChange={(e) => {
              const newDatasetId = e.target.value;
              setSelectedDataset(newDatasetId);
              if (newDatasetId) {
                setPage(0);
                fetchDatasetContent(newDatasetId, 0, pageSize);
              }
            }}
            label="Select Dataset"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {datasets.map((dataset) => (
              <MenuItem key={dataset._id} value={dataset._id}>
                {dataset.name || dataset._id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {datasetContent && columns.length > 0 && (
          <Box sx={{ 
            position: 'relative', 
            height: '70vh',
            width: '100%',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0',
            },
            '& .MuiDataGrid-virtualScroller': {
              minHeight: '200px',
            }
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: '-40px',
              right: '10px',
              zIndex: 2,
              display: 'flex',
              gap: 1
            }}>
              <Tooltip title="Column Management & Statistics">
                <IconButton 
                  onClick={() => setShowColumnManager(true)}
                  size="medium"
                  sx={{
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    boxShadow: 1
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <DataGrid
              rows={datasetContent?.rows || []}
              columns={columns}
              rowCount={totalRows}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode="server"
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              components={{
                Toolbar: GridToolbar
              }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 }
                }
              }}
              density="compact"
              autoHeight={false}
              sx={{
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  lineHeight: '1.2em',
                  padding: '8px'
                },
                '& .MuiDataGrid-row': {
                  minHeight: '48px !important'
                },
                '& .MuiDataGrid-columnHeader': {
                  padding: '8px'
                }
              }}
            />
          </Box>
        )}
      </Paper>
      <Drawer
        anchor="right"
        open={showColumnManager}
        onClose={() => setShowColumnManager(false)}
        sx={{ 
          '& .MuiDrawer-paper': { 
            width: 350,
            padding: 2,
            boxSizing: 'border-box'
          } 
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Column Management & Statistics
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            {columns.map((column) => {
              const stats = columnStats[column.field] || {};
              return (
                <ListItem
                  key={column.field}
                  secondaryAction={
                    <IconButton onClick={() => togglePinColumn(column.field)}>
                      {pinnedColumns.includes(column.field) 
                        ? <PushPinIcon /> 
                        : <PushPinOutlinedIcon />}
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={column.headerName}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={stats.type || 'unknown'} 
                            size="small"
                            color={stats.type === 'number' ? 'primary' : 'default'}
                          />
                          {stats.type === 'number' && stats.numeric && (
                            <Tooltip title={
                              `Min: ${stats.numeric.min.toFixed(2)}
                               Max: ${stats.numeric.max.toFixed(2)}
                               Mean: ${stats.numeric.mean.toFixed(2)}
                               Median: ${stats.numeric.median.toFixed(2)}`
                            }>
                              <Chip 
                                label="Stats" 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                              />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {stats.distinct || 0} unique, {stats.empty || 0} empty
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default DatasetList; 