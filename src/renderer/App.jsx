import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DriveSelector from './components/DriveSelector';
import SearchInput from './components/SearchInput';
import SearchResults from './components/SearchResults';
import RecentProjects from './components/RecentProjects';

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
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);

  const formatHint = useMemo(() => {
    if (selectedDrive === 'G:' || selectedDrive === 'R:') {
      return 'Format: NNNN-XX';
    }
    return 'Format: YYYY-NNN or YY-NNNNN';
  }, [selectedDrive]);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = async () => {
    try {
      const result = await window.electronAPI.getRecentProjects();
      if (result.success) {
        setRecentProjects(result.projects);
      }
    } catch (error) {
      console.error('Error loading recent projects:', error);
    }
  };

  const handleDriveChange = (drive) => {
    setSelectedDrive(drive);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);

    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI.searchProjects(selectedDrive, query);
      if (result.success) {
        setSearchResults(result.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDrive]);

  const handleSelectProject = async (project) => {
    try {
      await window.electronAPI.openFolder(project.path);
      
      // Add to recent projects
      const result = await window.electronAPI.addRecentProject({
        path: project.path,
        name: project.name,
        drive: selectedDrive
      });
      
      if (result.success) {
        setRecentProjects(result.projects);
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  const handleClearRecent = async () => {
    try {
      const result = await window.electronAPI.clearRecentProjects();
      if (result.success) {
        setRecentProjects(result.projects);
      }
    } catch (error) {
      console.error('Error clearing recent projects:', error);
    }
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
          <SearchResults
            results={searchResults}
            onSelect={handleSelectProject}
            isLoading={isLoading}
          />
          <RecentProjects
            recentProjects={recentProjects}
            onSelect={handleSelectProject}
            onClear={handleClearRecent}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
