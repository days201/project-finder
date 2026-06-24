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
import ErrorAlert from './components/ErrorAlert';

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
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const formatHint = useMemo(() => {
    if (selectedDrive === 'G:' || selectedDrive === 'R:') {
      return 'Format: NNNN-XX';
    }
    return 'Format: YYYY-NNN or YY-NNNNN';
  }, [selectedDrive]);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  // Reset selectedIndex when search results or recent projects change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults, recentProjects]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+G/J/R for drive switching
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          handleDriveChange('G:');
          return;
        }
        if (e.key === 'j' || e.key === 'J') {
          e.preventDefault();
          handleDriveChange('J:');
          return;
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          handleDriveChange('R:');
          return;
        }
      }

      // Escape to close app
      if (e.key === 'Escape') {
        e.preventDefault();
        window.close();
        return;
      }

      // Determine navigable list
      const hasResults = searchResults.length > 0;
      const hasRecent = recentProjects.length > 0;
      const listLength = hasResults ? Math.min(searchResults.length, 10) : (hasRecent ? recentProjects.length : 0);

      if (listLength === 0) return;

      // Up arrow
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? listLength - 1 : prev - 1));
        return;
      }

      // Down arrow
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev >= listLength - 1 ? 0 : prev + 1));
        return;
      }

      // Enter to open selected
      if (e.key === 'Enter') {
        e.preventDefault();
        const idx = selectedIndex >= 0 ? selectedIndex : 0;
        if (hasResults && idx < Math.min(searchResults.length, 10)) {
          handleSelectProject(searchResults[idx]);
        } else if (hasRecent && idx < recentProjects.length) {
          handleSelectProject(recentProjects[idx]);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, recentProjects, selectedIndex, selectedDrive]);

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
    setError(null);

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
        setError({ type: 'error', message: result.error || 'Search failed' });
      }
    } catch (err) {
      setSearchResults([]);
      setError({ type: 'error', message: 'An error occurred while searching' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDrive]);

  const handleSelectProject = async (project) => {
    setError(null);
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
    } catch (err) {
      setError({ type: 'error', message: 'Failed to open project folder' });
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
          <ErrorAlert error={error} onClose={() => setError(null)} />
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
            selectedIndex={searchResults.length > 0 ? selectedIndex : -1}
          />
          <RecentProjects
            recentProjects={recentProjects}
            onSelect={handleSelectProject}
            onClear={handleClearRecent}
            selectedIndex={searchResults.length === 0 ? selectedIndex : -1}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
