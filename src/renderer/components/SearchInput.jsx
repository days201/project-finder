import React from 'react';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

function SearchInput({ searchQuery, onSearch, formatHint }) {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Project Number"
        placeholder="Enter project number..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        variant="outlined"
        size="small"
        autoFocus
      />
      <FormHelperText>
        {formatHint}
      </FormHelperText>
    </Box>
  );
}

export default SearchInput;
