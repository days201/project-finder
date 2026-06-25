import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// Non-intrusive bottom-of-window spinner shown only while the background
// drive re-sync runs. Hidden when status is 'done' or 'error'.
function SyncIndicator({ status }) {
  if (status !== 'syncing') return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <CircularProgress size={14} />
      <Typography variant="caption" color="text.secondary">
        Re syncing with drives
      </Typography>
    </Box>
  );
}

export default SyncIndicator;