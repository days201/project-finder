import React from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import ListItemIcon from '@mui/material/ListItemIcon';

function SearchResults({ results, onSelect, isLoading, selectedIndex }) {
  if (isLoading) {
    return (
      <Paper sx={{ mb: 2, p: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Searching...
        </Typography>
      </Paper>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
      <List dense>
        {results.slice(0, 10).map((project, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => onSelect(project)}
              selected={index === selectedIndex}
            >
              <ListItemIcon>
                <FolderIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={project.name}
                secondary={project.year}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default SearchResults;
