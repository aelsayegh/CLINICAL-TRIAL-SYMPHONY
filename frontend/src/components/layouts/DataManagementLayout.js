import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import TransformIcon from '@mui/icons-material/Transform';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const DataManagementLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Update getActiveTab to handle both paths
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/snapshots')) return '/data-management/snapshots';
    if (path.includes('/datasets')) return '/data-management/datasets';
    if (path.includes('/transformation')) return '/data-management/transformation';
    if (path.includes('/export')) return '/data-management/export';
    return '/data-management/snapshots';
  };

  return (
    <Box>
      <Paper sx={{ borderRadius: 0, mb: 3 }}>
        <Tabs 
          value={getActiveTab()}
          onChange={(e, newValue) => navigate(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<PhotoLibraryIcon />}
            iconPosition="start"
            label="Snapshots" 
            value="/data-management/snapshots" 
          />
          <Tab 
            icon={<StorageIcon />}
            iconPosition="start"
            label="Datasets" 
            value="/data-management/datasets" 
          />
          <Tab 
            icon={<TransformIcon />}
            iconPosition="start"
            label="Data Transformation" 
            value="/data-management/transformation" 
          />
          <Tab 
            icon={<AutoAwesomeIcon />}
            iconPosition="start"
            label="Transformed Datasets" 
            value="/data-management/transformed-datasets" 
          />
        </Tabs>
      </Paper>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DataManagementLayout; 