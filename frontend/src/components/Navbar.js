import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ 
          flexGrow: 1, 
          color: 'white',
          textDecoration: 'none'
        }}>
          Clinical Trial Symphony
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link 
            to="/data-import" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Data Import
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 