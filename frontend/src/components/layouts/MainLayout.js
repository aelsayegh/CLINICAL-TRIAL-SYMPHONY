import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import TransformIcon from '@mui/icons-material/Transform';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab based on current path
  const getMainTab = () => {
    return location.pathname.includes('/data-management') ? 0 : 1;
  };

  const getDataManagementTab = () => {
    if (location.pathname.includes('/snapshots')) return 0;
    if (location.pathname.includes('/datasets')) return 1;
    if (location.pathname.includes('/transformation')) return 2;
    return 0;
  };

  // Handle main tab change
  const handleMainTabChange = (event, newValue) => {
    if (newValue === 0) {
      navigate('/data-management/snapshots');
    }
  };

  // Handle data management sub-tab change
  const handleDataManagementTabChange = (event, newValue) => {
    if (newValue === 0) {
      navigate('/data-management/snapshots');
    } else if (newValue === 1) {
      navigate('/data-management/datasets');
    } else if (newValue === 2) {
      navigate('/data-management/transformation');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Clinical Trial Symphony
          </Typography>
        </Toolbar>
        <Tabs 
          value={getMainTab()} 
          onChange={handleMainTabChange}
          sx={{ bgcolor: 'background.paper' }}
        >
          <Tab label="Data Management" />
          <Tab label="Visualizations" disabled />
        </Tabs>
      </AppBar>

      {location.pathname.includes('/data-management') && (
        <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={getDataManagementTab()} 
            onChange={handleDataManagementTabChange}
            centered
          >
            <Tab icon={<PhotoLibraryIcon />} iconPosition="start" label="Snapshots" />
            <Tab icon={<StorageIcon />} iconPosition="start" label="Datasets" />
            <Tab icon={<TransformIcon />} iconPosition="start" label="Transformation" />
          </Tabs>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default MainLayout; 