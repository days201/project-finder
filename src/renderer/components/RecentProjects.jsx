import React from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

function RecentProjects({ recentProjects, onSelect, onClear, selectedIndex }) {
  if (!recentProjects || recentProjects.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Recent Projects
        </Typography>
        <Tooltip title="Clear history">
          <IconButton size="small" onClick={onClear}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <List dense>
        {recentProjects.map((project, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => onSelect(project)}
              selected={index === selectedIndex}
            >
              <ListItemIcon>
                <HistoryIcon color="action" />
              </ListItemIcon>
              <ListItemText
                primary={project.name}
                secondary={project.drive}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default RecentProjects;
