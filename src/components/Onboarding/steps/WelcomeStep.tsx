import { Box, Typography, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FitnessCenter, CalendarMonth, TrendingUp } from '@mui/icons-material';

export function WelcomeStep() {
  return (
    <Box textAlign="center" pt={2}>
      <FitnessCenter sx={{ fontSize: 72, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Welcome to GymBro
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Let's set you up in under a minute. You can always update everything later in your profile.
      </Typography>
      <List dense sx={{ textAlign: 'left', maxWidth: 320, mx: 'auto' }}>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <FitnessCenter color="primary" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Personalised calorie & protein targets"
            secondary="Based on your stats and goals"
          />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <CalendarMonth color="primary" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Weekly workout schedule"
            secondary="Choose which routines to do each day"
          />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <TrendingUp color="primary" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Progress tracking"
            secondary="PRs, volume, and history at a glance"
          />
        </ListItem>
      </List>
      <Stack direction="row" justifyContent="center" mt={2}>
        <Typography variant="caption" color="text.disabled">
          You can skip this wizard at any time
        </Typography>
      </Stack>
    </Box>
  );
}
