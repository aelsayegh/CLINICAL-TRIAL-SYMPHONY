import React from 'react';
import { useRouteError } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

export default function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Oops!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Sorry, an unexpected error has occurred.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            <i>{error.statusText || error.message}</i>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
} 