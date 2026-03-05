import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { useAppSelector } from './store/hooks';
import { selectDarkMode, selectAuthLoading } from './store/selectors';
import { useAppInit } from './hooks/useAppInit';
import { AppShell }     from './components/AppShell/AppShell';
import { TodayPage }    from './components/Today/TodayPage';
import { SchedulePage } from './components/Schedule/SchedulePage';
import { RoutinesPage } from './components/Routines/RoutinesPage';
import { RoutineEditor } from './components/Routines/RoutineEditor';
import { WorkoutLogger } from './components/Workout/WorkoutLogger';
import { ProgressPage }  from './components/Progress/ProgressPage';
import { ProfilePage }   from './components/Profile/ProfilePage';

function AppRoutes() {
  useAppInit();
  const authLoading = useAppSelector(selectAuthLoading);
  const darkMode    = useAppSelector(selectDarkMode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary:   { main: '#6C63FF' },
          secondary: { main: '#FF6584' },
          background: darkMode
            ? { default: '#121212', paper: '#1E1E2E' }
            : { default: '#F5F5F5', paper: '#FFFFFF' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiBottomNavigation: {
            styleOverrides: {
              root: { height: 64 },
            },
          },
          MuiBottomNavigationAction: {
            styleOverrides: {
              root: { minWidth: 60 },
            },
          },
        },
      }),
    [darkMode]
  );

  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress size={48} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell>
        <Routes>
          <Route path="/"                    element={<Navigate to="/today" replace />} />
          <Route path="/today"               element={<TodayPage />} />
          <Route path="/schedule"            element={<SchedulePage />} />
          <Route path="/routines"            element={<RoutinesPage />} />
          <Route path="/routines/:routineId" element={<RoutineEditor />} />
          <Route path="/workout/current"     element={<WorkoutLogger />} />
          <Route path="/progress"            element={<ProgressPage />} />
          <Route path="/profile"             element={<ProfilePage />} />
          <Route path="*"                    element={<Navigate to="/today" replace />} />
        </Routes>
      </AppShell>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
