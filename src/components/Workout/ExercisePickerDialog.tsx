import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Checkbox, Chip, Typography, Box, FormControlLabel, Divider,
  useMediaQuery, useTheme,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { selectRoutineExercisesForRoutine } from '../../store/selectors';
import type { RoutineExercise } from '../../types';

interface Props {
  open: boolean;
  routineId: string;
  routineName: string;
  onClose: () => void;
  onStart: (selected: RoutineExercise[]) => void;
}

export function ExercisePickerDialog({ open, routineId, routineName, onClose, onStart }: Props) {
  const theme      = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const routineExercises = useAppSelector(s => selectRoutineExercisesForRoutine(s, routineId));
  const exerciseMap      = useAppSelector(s => s.exercises.items);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(routineExercises.map(re => re.id))
  );

  function toggle(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected  = selectedIds.size === routineExercises.length;
  const noneSelected = selectedIds.size === 0;
  const someSelected = !allSelected && !noneSelected;

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(routineExercises.map(re => re.id)));
  }

  function handleStart() {
    const selected = routineExercises.filter(re => selectedIds.has(re.id));
    onStart(selected);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>{routineName}</Typography>
        <Typography variant="caption" color="text.secondary">
          Select exercises for this session
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {/* Select All toggle */}
        <Box px={2} py={1} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                size="small"
              />
            }
            label={
              <Typography variant="body2" fontWeight={600}>
                {allSelected ? 'Deselect All' : 'Select All'}
                <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                  ({selectedIds.size}/{routineExercises.length})
                </Typography>
              </Typography>
            }
          />
        </Box>

        <List disablePadding>
          {routineExercises.map(re => {
            const exercise = exerciseMap[re.exerciseId];
            if (!exercise) return null;
            const checked = selectedIds.has(re.id);
            return (
              <ListItem key={re.id} disablePadding divider>
                <ListItemButton onClick={() => toggle(re.id)} dense>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={exercise.name}
                    secondary={`${re.defaultSets} sets · ${re.repMin}–${re.repMax} reps`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: checked ? 600 : 400 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip
                    label={exercise.category}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1, fontSize: '0.65rem', height: 20 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handleStart}
          disabled={noneSelected}
        >
          Start Workout ({selectedIds.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
