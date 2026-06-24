import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const drives = [
  { value: 'G:', label: 'G:' },
  { value: 'J:', label: 'J:' },
  { value: 'R:', label: 'R:' },
];

function DriveSelector({ selectedDrive, onDriveChange }) {
  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="drive-select-label">Drive</InputLabel>
      <Select
        labelId="drive-select-label"
        id="drive-select"
        value={selectedDrive}
        label="Drive"
        onChange={(e) => onDriveChange(e.target.value)}
      >
        {drives.map((drive) => (
          <MenuItem key={drive.value} value={drive.value}>
            {drive.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default DriveSelector;
