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
    const newSet: DraftSet = {
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
    // Auto-start rest timer when set is marked done
    if (patch.done === true) {
      dispatch(startRestTimer(defaultRest));
    }
  }

  function handleSetDelete(setIndex: number) {
    dispatch(removeSet({ entryId: entry.id, setIndex }));
  }

  const completedSets = entry.sets.filter(s => s.done).length;

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
        subheader={
          best && lastDate ? (
            <Typography variant="caption" color="text.secondary">
              Last: {best.weight}kg × {best.reps} · e1RM {best.e1rm}kg
            </Typography>
          ) : (
            <Typography variant="caption" color="text.disabled">No previous data</Typography>
          )
        }
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
                  <TableCell sx={{ py: 0.5 }}>kg</TableCell>
                  <TableCell sx={{ py: 0.5 }}>Reps</TableCell>
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
                    onChange={patch => handleSetChange(s.setIndex, patch)}
                    onDelete={() => handleSetDelete(s.setIndex)}
                  />
                ))}
              </TableBody>
            </Table>
          )}

          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<Add />} onClick={() => handleAddSet(false)} sx={{ flex: 1 }}>
              Add Set
            </Button>
            <Button size="small" variant="outlined" onClick={() => handleAddSet(true)} color="warning">
              + Warmup
            </Button>
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}
