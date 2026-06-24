import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DriveSelector from './components/DriveSelector';
import SearchInput from './components/SearchInput';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  const [selectedDrive, setSelectedDrive] = useState('G:');
  const [searchQuery, setSearchQuery] = useState('');

  const formatHint = useMemo(() => {
    if (selectedDrive === 'G:' || selectedDrive === 'R:') {
      return 'Format: NNNN-XX';
    }
    return 'Format: YYYY-NNN or YY-NNNNN';
  }, [selectedDrive]);

  const handleDriveChange = (drive) => {
    setSelectedDrive(drive);
    setSearchQuery('');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Project Finder
          </Typography>
          <DriveSelector
            selectedDrive={selectedDrive}
            onDriveChange={handleDriveChange}
          />
          <SearchInput
            searchQuery={searchQuery}
            onSearch={handleSearch}
            formatHint={formatHint}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
