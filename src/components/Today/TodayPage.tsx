import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActions,
  Button, Chip, Divider, Stack,
} from '@mui/material';
import { PlayArrow, CheckCircle, FitnessCenter } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTodayRoutine, selectDraft, selectUid, selectRecentSessions } from '../../store/selectors';
import { startDraft } from '../../store/slices/workoutDraftSlice';
import { generateId } from '../../utils';
import type { DraftEntry, DraftSet, RoutineExercise } from '../../types';
import { DAY_NAMES, formatDate, formatDuration } from '../../utils';

export function TodayPage() {
  const navigate      = useNavigate();
  const dispatch      = useAppDispatch();
  const uid           = useAppSelector(selectUid);
  const todayRoutine  = useAppSelector(selectTodayRoutine);
  const draft         = useAppSelector(selectDraft);
  const recentSessions = useAppSelector(selectRecentSessions);
  const allREs        = useAppSelector(s => s.routines.routineExercises);

  const routineExercises = todayRoutine
    ? Object.values(allREs).filter(re => re.routineId === todayRoutine.id).sort((a,b) => a.order - b.order)
    : [];

  const today     = new Date();
  const todayName = DAY_NAMES[today.getDay()];

  function buildDraft(re: RoutineExercise[]): void {
    if (!todayRoutine || !uid) return;
    const sessionId = generateId();
    const entries: DraftEntry[] = re.map((r, i) => {
      const entryId = `${sessionId}_entry${i}`;
      const sets: DraftSet[] = Array.from({ length: r.defaultSets }, (_, si) => ({
        id:       `${entryId}_set${si}`,
        setIndex: si,
        weight:   0,
        reps:     r.repMin,
        done:     false,
      }));
      return { id: entryId, exerciseId: r.exerciseId, order: i, sets };
    });
    dispatch(startDraft({ sessionId, routineId: todayRoutine.id, startedAt: Date.now(), entries }));
    navigate('/workout/current');
  }

  if (draft && draft.routineId === todayRoutine?.id) {
    return (
      <Box p={2}>
        <Typography variant="h5" fontWeight={700} gutterBottom>{todayName}</Typography>
        <Card sx={{ borderRadius: 3, mb: 2 }} elevation={3}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <FitnessCenter color="primary" />
              <Typography variant="h6">{todayRoutine?.name ?? 'Workout'} in Progress</Typography>
            </Stack>
            <Typography color="text.secondary">You have an active workout draft.</Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained" size="large" startIcon={<PlayArrow />} fullWidth
              onClick={() => navigate('/workout/current')}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Resume Workout
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight={700} gutterBottom>{todayName}</Typography>

      {todayRoutine ? (
        <Card sx={{ borderRadius: 3, mb: 3 }} elevation={3}>
          <CardContent>
            <Chip label="Today's Session" color="primary" size="small" sx={{ mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>{todayRoutine.name}</Typography>
            {todayRoutine.description && (
              <Typography color="text.secondary" mb={1}>{todayRoutine.description}</Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              {routineExercises.length} exercises
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              variant="contained" size="large" startIcon={<PlayArrow />} fullWidth
              onClick={() => buildDraft(routineExercises)}
              sx={{ borderRadius: 2, py: 1.5, fontSize: '1rem' }}
            >
              Start Workout
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, mb: 3 }} elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Rest Day 🎉
            </Typography>
            <Typography color="text.secondary">
              No session scheduled for today. Check the Schedule tab to set one.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Recent Workouts</Typography>
          <Stack spacing={1.5}>
            {recentSessions.slice(0, 5).map(s => (
              <Card key={s.id} elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {formatDate(s.date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDuration(s.durationSeconds)}
                      </Typography>
                    </Box>
                    <CheckCircle color="success" fontSize="small" />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
