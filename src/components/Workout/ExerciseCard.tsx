import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, Typography, Table, TableBody,
  TableHead, TableRow, TableCell, Button, Stack, Chip, IconButton,
  Collapse,
} from '@mui/material';
import { Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addSet, updateSet, removeSet } from '../../store/slices/workoutDraftSlice';
import { startRestTimer } from '../../store/slices/uiSlice';
import { SetRow } from './SetRow';
import type { DraftEntry, DraftSet, SetEntry } from '../../types';
import { getLastPerformanceForExercise } from '../../firebase/dataLayer';
import { calcBestSet } from '../../utils';

interface Props {
  entry:  DraftEntry;
  uid:    string;
  defaultRest: number;
}

export function ExerciseCard({ entry, uid, defaultRest }: Props) {
  const dispatch = useAppDispatch();
  const exercise = useAppSelector(s => s.exercises.items[entry.exerciseId]);
  const [expanded, setExpanded] = useState(true);
  const [lastSets, setLastSets] = useState<SetEntry[]>([]);
  const [lastDate, setLastDate] = useState<number | null>(null);

  const isCardio = exercise?.category === 'cardio';

  useEffect(() => {
    getLastPerformanceForExercise(uid, entry.exerciseId).then(res => {
      if (res) {
        setLastSets(res.sets);
        setLastDate(res.sessionDate);
      }
    });
  }, [uid, entry.exerciseId]);

  const best = calcBestSet(lastSets);

  function handleAddSet(isWarmup = false) {
    const nextIndex = entry.sets.length;
    const last      = entry.sets[entry.sets.length - 1];
    const newSet: DraftSet = isCardio
      ? {
          id:              `${entry.id}_set${nextIndex}`,
          setIndex:        nextIndex,
          weight:          0,
          reps:            0,
          done:            false,
          durationMinutes: last?.durationMinutes ?? 30,
        }
      : {
          id:       `${entry.id}_set${nextIndex}`,
          setIndex: nextIndex,
          weight:   last?.weight ?? 0,
          reps:     last?.reps   ?? 8,
          isWarmup,
          done:     false,
        };
    dispatch(addSet({ entryId: entry.id, set: newSet }));
  }

  function handleSetChange(setIndex: number, patch: Partial<DraftSet>) {
    dispatch(updateSet({ entryId: entry.id, setIndex, patch }));
    if (patch.done === true) {
      dispatch(startRestTimer(defaultRest));
    }
  }

  function handleSetDelete(setIndex: number) {
    dispatch(removeSet({ entryId: entry.id, setIndex }));
  }

  const completedSets = entry.sets.filter(s => s.done).length;

  // Build last-session subheader
  function renderLastSession() {
    if (!lastDate) {
      return <Typography variant="caption" color="text.disabled">No previous data</Typography>;
    }
    if (isCardio) {
      const totalMins = lastSets.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
      if (totalMins === 0) return <Typography variant="caption" color="text.disabled">No previous data</Typography>;
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const label = h > 0 ? `${h}h ${m}m` : `${m}m`;
      return (
        <Typography variant="caption" color="text.secondary">
          Last: {label}
        </Typography>
      );
    }
    if (!best) return <Typography variant="caption" color="text.disabled">No previous data</Typography>;
    return (
      <Typography variant="caption" color="text.secondary">
        Last: {best.weight}kg × {best.reps} · e1RM {best.e1rm}kg
      </Typography>
    );
  }

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 2, overflow: 'visible' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              {exercise?.name ?? entry.exerciseId}
            </Typography>
            <Chip
              label={`${completedSets}/${entry.sets.length}`}
              size="small"
              color={completedSets === entry.sets.length && entry.sets.length > 0 ? 'success' : 'default'}
            />
          </Stack>
        }
        subheader={renderLastSession()}
        action={
          <IconButton onClick={() => setExpanded(v => !v)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
        sx={{ pb: 0 }}
      />

      <Collapse in={expanded}>
        <CardContent sx={{ pt: 1 }}>
          {entry.sets.length > 0 && (
            <Table size="small" sx={{ mb: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 0.5, pl: 1 }}>#</TableCell>
                  {isCardio ? (
                    <>
                      <TableCell sx={{ py: 0.5 }}>hrs</TableCell>
                      <TableCell sx={{ py: 0.5 }}>min</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ py: 0.5 }}>kg</TableCell>
                      <TableCell sx={{ py: 0.5 }}>Reps</TableCell>
                    </>
                  )}
                  <TableCell sx={{ py: 0.5 }}>Done</TableCell>
                  <TableCell sx={{ py: 0.5 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {entry.sets.map(s => (
                  <SetRow
                    key={s.setIndex}
                    set={s}
                    lastWeight={lastSets[s.setIndex]?.weight}
                    lastReps={lastSets[s.setIndex]?.reps}
                    lastDurationMinutes={lastSets[s.setIndex]?.durationMinutes}
                    isCardio={isCardio}
                    onChange={patch => handleSetChange(s.setIndex, patch)}
                    onDelete={() => handleSetDelete(s.setIndex)}
                  />
                ))}
              </TableBody>
            </Table>
          )}

          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<Add />} onClick={() => handleAddSet(false)} sx={{ flex: 1 }}>
              {isCardio ? 'Add Session' : 'Add Set'}
            </Button>
            {!isCardio && (
              <Button size="small" variant="outlined" onClick={() => handleAddSet(true)} color="warning">
                + Warmup
              </Button>
            )}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}
