import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, BottomNavigation, BottomNavigationAction, Paper, AppBar,
  Toolbar, Typography, IconButton, Snackbar, Alert,
} from '@mui/material';
import {
  FitnessCenter, Today, DateRange, ShowChart, Person, Brightness4, Brightness7,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectSnackbar, selectDarkMode } from '../../store/selectors';
import { hideSnackbar, toggleDarkMode } from '../../store/slices/uiSlice';
import { ResumeWorkoutPrompt } from '../Workout/ResumeWorkoutPrompt';

const NAV_ITEMS = [
  { label: 'Today',    icon: <Today />,          path: '/today'    },
  { label: 'Schedule', icon: <DateRange />,       path: '/schedule' },
  { label: 'Routines', icon: <FitnessCenter />,   path: '/routines' },
  { label: 'Progress', icon: <ShowChart />,        path: '/progress' },
  { label: 'Profile',  icon: <Person />,           path: '/profile'  },
];

interface Props { children: ReactNode }

export function AppShell({ children }: Props) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useAppDispatch();
  const snackbar   = useAppSelector(selectSnackbar);
  const darkMode   = useAppSelector(selectDarkMode);

  const currentTab = NAV_ITEMS.findIndex(n => location.pathname.startsWith(n.path));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Top App Bar */}
      <AppBar position="sticky" elevation={0} sx={{ zIndex: 10 }}>
        <Toolbar>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, letterSpacing: 1 }}>
            GymBro
          </Typography>
          <IconButton color="inherit" onClick={() => dispatch(toggleDarkMode())}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Resume Workout Banner */}
      <ResumeWorkoutPrompt />

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, overflowY: 'auto', pb: 8 }}>
        {children}
      </Box>

      {/* Bottom Navigation */}
      <Paper
        elevation={4}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <BottomNavigation
          value={currentTab}
          onChange={(_, v) => navigate(NAV_ITEMS[v].path)}
          showLabels
        >
          {NAV_ITEMS.map(n => (
            <BottomNavigationAction key={n.label} label={n.label} icon={n.icon} />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => dispatch(hideSnackbar())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 70 }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => dispatch(hideSnackbar())}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
