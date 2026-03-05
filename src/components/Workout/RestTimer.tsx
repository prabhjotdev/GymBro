import { Box, Typography, Stack, Button, LinearProgress } from '@mui/material';
import { Timer, Stop } from '@mui/icons-material';
import { useAppDispatch } from '../../store/hooks';
import { startRestTimer, stopRestTimer } from '../../store/slices/uiSlice';
import { useRestTimer } from '../../hooks/useRestTimer';
import { formatTime } from '../../utils';

const PRESETS = [60, 90, 120] as const;

export function RestTimer() {
  const dispatch = useAppDispatch();
  const timer    = useRestTimer();

  const progress = timer.active ? ((timer.seconds - timer.remaining) / timer.seconds) * 100 : 0;

  return (
    <Box
      sx={{
        p: 2, borderRadius: 2, bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Timer fontSize="small" color={timer.active ? 'primary' : 'disabled'} />
        <Typography variant="subtitle2">Rest Timer</Typography>
      </Stack>

      {timer.active ? (
        <>
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            color={timer.remaining <= 10 ? 'error.main' : 'primary.main'}
            mb={1}
          >
            {formatTime(timer.remaining)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 6, borderRadius: 3, mb: 2 }}
          />
          <Button
            variant="outlined" color="error" startIcon={<Stop />}
            fullWidth onClick={() => dispatch(stopRestTimer())}
          >
            Stop
          </Button>
        </>
      ) : (
        <Stack direction="row" spacing={1} justifyContent="center">
          {PRESETS.map(s => (
            <Button
              key={s}
              variant="outlined"
              size="small"
              onClick={() => dispatch(startRestTimer(s))}
              sx={{ flex: 1 }}
            >
              {s}s
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
}
