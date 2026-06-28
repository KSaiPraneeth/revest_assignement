'use client';

import { Alert, Box, Button, Typography } from '@mui/material';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Something went wrong: {this.state.message}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            If the problem persists, try signing out and back in, or contact support.
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}
