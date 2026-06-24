import React from 'react';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

function ErrorAlert({ error, onClose }) {
  if (!error) {
    return null;
  }

  return (
    <Collapse in={!!error}>
      <Alert
        severity={error.type || 'error'}
        onClose={onClose}
        sx={{ mb: 2 }}
      >
        {error.message}
      </Alert>
    </Collapse>
  );
}

export default ErrorAlert;
