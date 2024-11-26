import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const ExportToolbar = ({ gridRef, filename }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (type) => {
    handleClose();
    setLoading(true);
    try {
      let data;
      let exportFilename = filename.split('.')[0];
      
      // Get the data based on selection
      if (type === 'selected') {
        data = gridRef.current.api.getSelectedRows();
        exportFilename += '_selected';
      } else if (type === 'filtered') {
        data = [];
        gridRef.current.api.forEachNodeAfterFilter(node => {
          data.push(node.data);
        });
        exportFilename += '_filtered';
      } else {
        data = [];
        gridRef.current.api.forEachNode(node => {
          data.push(node.data);
        });
      }

      if (data.length === 0) {
        throw new Error('No data to export');
      }

      // Convert data to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const cell = row[header] ?? '';
            return typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell;
          }).join(',')
        )
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        open: true,
        message: `Successfully exported ${data.length} rows`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Export failed:', error);
      setNotification({
        open: true,
        message: error.message || 'Export failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <ButtonGroup variant="contained" disabled={loading}>
        <Button
          startIcon={<FileDownloadIcon />}
          onClick={handleClick}
        >
          Export
        </Button>
        <Button
          startIcon={<FilterAltIcon />}
          onClick={() => handleExport('filtered')}
        >
          Export Filtered
        </Button>
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExport('all')}>Export All</MenuItem>
        <MenuItem onClick={() => handleExport('selected')}>Export Selected</MenuItem>
      </Menu>

      {loading && (
        <CircularProgress 
          size={24} 
          sx={{ 
            ml: 2,
            verticalAlign: 'middle'
          }} 
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportToolbar; 