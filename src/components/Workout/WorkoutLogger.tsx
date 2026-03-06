import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Fab, CircularProgress,
} from '@mui/material';
import { Check, Close, Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectDraft, selectUid } from '../../store/selectors';
import { clearDraft } from '../../store/slices/workoutDraftSlice';
import { prependSession } from '../../store/slices/sessionsSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { commitWorkout } from '../../firebase/dataLayer';
import type { WorkoutSession } from '../../types';
import { formatDuration } from '../../utils';
import { AddExerciseDialog } from './AddExerciseDialog';

export function WorkoutLogger() {
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const uid        = useAppSelector(selectUid)!;
  const draft      = useAppSelector(selectDraft);
  const routines   = useAppSelector(s => s.routines.items);
  const allREs     = useAppSelector(s => s.routines.routineExercises);

  const [elapsed, setElapsed]       = useState(0);
  const [finishOpen, setFinishOpen] = useState(false);
  const [addExOpen, setAddExOpen]   = useState(false);
  const [notes, setNotes]           = useState('');
  const [saving, setSaving]         = useState(false);
  const intervalRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (!draft) {
    return (
      <Box p={3} textAlign="center">
        <Alert severity="info">No active workout. Start from the Today tab.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/today')}>Go to Today</Button>
      </Box>
    );
  }

  const routine = routines[draft.routineId];

  // Get rest time for each entry from routine exercises
  function getDefaultRest(exerciseId: string): number {
    const re = Object.values(allREs).find(
      r => r.routineId === draft!.routineId && r.exerciseId === exerciseId
    );
    return re?.restSeconds ?? 90;
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await commitWorkout(uid, draft!, elapsed, notes);
      const session: WorkoutSession = {
        id:              draft!.sessionId,
        date:            draft!.startedAt,
        routineId:       draft!.routineId,
        durationSeconds: elapsed,
        status:          'completed',
        notes,
      };
      dispatch(prependSession(session));
      dispatch(clearDraft());
      dispatch(showSnackbar({ message: 'Workout saved! Great job!', severity: 'success' }));
      navigate('/today');
    } catch {
      dispatch(showSnackbar({ message: 'Save failed – try again', severity: 'error' }));
    } finally {
      setSaving(false);
      setFinishOpen(false);
    }
  }

  function handleDiscard() {
    dispatch(clearDraft());
    navigate('/today');
  }

  const totalSets = draft.entries.reduce((a, e) => a + e.sets.length, 0);
  const doneSets  = draft.entries.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);

  return (
    <Box pb={10}>
      {/* Header */}
      <Box px={2} pt={2} pb={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight={700}>{routine?.name ?? 'Workout'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDuration(elapsed)} · {doneSets}/{totalSets} sets done
            </Typography>
          </Box>
          <Button
            size="small" color="error" startIcon={<Close />}
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </Stack>
      </Box>

      <Divider />

      {/* Exercise Cards */}
      <Box px={2} pt={2}>
        {draft.entries.map(entry => (
          <ExerciseCard
            key={entry.id}
            entry={entry}
            uid={uid}
            defaultRest={getDefaultRest(entry.exerciseId)}
          />
        ))}

        <Button
          variant="outlined" startIcon={<Add />} fullWidth
          sx={{ borderRadius: 2, py: 1.5, mb: 2 }}
          onClick={() => setAddExOpen(true)}
        >
          Add Exercise
        </Button>

        {/* Rest Timer */}
        <RestTimer />
      </Box>

      {/* FAB Finish */}
      <Fab
        variant="extended"
        color="success"
        sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 20 }}
        onClick={() => setFinishOpen(true)}
      >
        <Check sx={{ mr: 1 }} />
        Finish
      </Fab>

      {/* Finish Dialog */}
      <Dialog open={finishOpen} onClose={() => setFinishOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Finish Workout?</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Duration: <strong>{formatDuration(elapsed)}</strong> · {doneSets} sets completed
          </Typography>
          <TextField
            label="Notes (optional)"
            multiline rows={3} fullWidth
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishOpen(false)}>Cancel</Button>
          <Button
            variant="contained" color="success"
            onClick={handleFinish}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <Check />}
          >
            Save Workout
          </Button>
        </DialogActions>
      </Dialog>

      <AddExerciseDialog
        open={addExOpen}
        onClose={() => setAddExOpen(false)}
        sessionId={draft.sessionId}
        currentOrder={draft.entries.length}
      />
    </Box>
  );
}
