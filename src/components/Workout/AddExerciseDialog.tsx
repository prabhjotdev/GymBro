import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItemButton, ListItemText, TextField,
  InputAdornment, Chip, Stack,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectExerciseList } from '../../store/selectors';
import { addEntry } from '../../store/slices/workoutDraftSlice';
import type { DraftEntry, ExerciseCategory } from '../../types';

interface Props {
  open:         boolean;
  onClose:      () => void;
  sessionId:    string;
  currentOrder: number;
}

const CATEGORIES: ExerciseCategory[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'cardio',
];

export function AddExerciseDialog({ open, onClose, sessionId, currentOrder }: Props) {
  const dispatch   = useAppDispatch();
  const exercises  = useAppSelector(selectExerciseList);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState<ExerciseCategory | ''>('');

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !category || e.category === category;
    return matchSearch && matchCat;
  });

  function handleSelect(exerciseId: string) {
    const entryId  = `${sessionId}_entry${currentOrder}`;
    const exercise = exercises.find(e => e.id === exerciseId);
    const isCardio = exercise?.category === 'cardio';
    const entry: DraftEntry = {
      id:         entryId,
      exerciseId,
      order:      currentOrder,
      sets: [isCardio
        ? { id: `${entryId}_set0`, setIndex: 0, weight: 0, reps: 0, done: false, durationMinutes: 30 }
        : { id: `${entryId}_set0`, setIndex: 0, weight: 0, reps: 8, done: false }
      ],
    };
    dispatch(addEntry(entry));
    onClose();
    setSearch('');
    setCategory('');
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '80vh' } }}>
      <DialogTitle>Add Exercise</DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        <TextField
          fullWidth autoFocus size="small" placeholder="Search exercises..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ mb: 1.5 }}
        />
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} mb={1}>
          <Chip
            label="All" size="small"
            onClick={() => setCategory('')}
            color={category === '' ? 'primary' : 'default'}
          />
          {CATEGORIES.map(c => (
            <Chip
              key={c} label={c} size="small"
              onClick={() => setCategory(cat => cat === c ? '' : c)}
              color={category === c ? 'primary' : 'default'}
            />
          ))}
        </Stack>
        <List dense disablePadding>
          {filtered.map(ex => (
            <ListItemButton key={ex.id} onClick={() => handleSelect(ex.id)} sx={{ borderRadius: 1 }}>
              <ListItemText
                primary={ex.name}
                secondary={`${ex.category}${ex.equipment ? ' · ' + ex.equipment : ''}`}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
