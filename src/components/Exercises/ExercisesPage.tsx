import { useState } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Chip, Stack,
  List, ListItemButton, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Select, MenuItem, FormControl, InputLabel, IconButton, Fab,
  Alert,
} from '@mui/material';
import { Search, Add, Edit as EditIcon, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectExerciseList, selectUid } from '../../store/selectors';
import { upsertExercise, removeExercise } from '../../store/slices/exercisesSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { generateId } from '../../utils';
import type { Exercise, ExerciseCategory, Equipment } from '../../types';

const CATEGORIES: ExerciseCategory[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'cardio', 'full_body',
];

const EQUIPMENT_OPTIONS: Equipment[] = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell', 'band', 'cardio',
];

const CATEGORY_COLORS: Record<ExerciseCategory, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  chest:      'primary',
  back:       'secondary',
  shoulders:  'info',
  biceps:     'success',
  triceps:    'warning',
  legs:       'error',
  core:       'default',
  cardio:     'success',
  full_body:  'primary',
};

interface EditState {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment | '';
  isCustom: boolean;
  notes: string;
}

const EMPTY_EDIT: EditState = {
  id:        '',
  name:      '',
  category:  'chest',
  equipment: '',
  isCustom:  true,
  notes:     '',
};

export function ExercisesPage() {
  const dispatch  = useAppDispatch();
  const uid       = useAppSelector(selectUid)!;
  const exercises = useAppSelector(selectExerciseList);

  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState<ExerciseCategory | ''>('');

  // Edit/create dialog
  const [editOpen, setEditOpen]   = useState(false);
  const [editState, setEditState] = useState<EditState>(EMPTY_EDIT);
  const [isNew, setIsNew]         = useState(false);

  // Delete confirm dialog
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !category || e.category === category;
    return matchSearch && matchCat;
  });

  function openEdit(ex: Exercise) {
    setEditState({
      id:        ex.id,
      name:      ex.name,
      category:  ex.category,
      equipment: ex.equipment ?? '',
      isCustom:  ex.isCustom,
      notes:     ex.notes ?? '',
    });
    setIsNew(false);
    setEditOpen(true);
  }

  function openCreate() {
    setEditState(EMPTY_EDIT);
    setIsNew(true);
    setEditOpen(true);
  }

  async function handleSave() {
    if (!editState.name.trim()) return;
    const exercise: Exercise = {
      id:        isNew ? generateId() : editState.id,
      name:      editState.name.trim(),
      category:  editState.category,
      equipment: editState.equipment || undefined,
      isCustom:  isNew ? true : editState.isCustom,
      notes:     editState.notes.trim() || undefined,
    };
    await dispatch(upsertExercise({ uid, exercise }));
    dispatch(showSnackbar({ message: isNew ? 'Exercise created!' : 'Exercise updated!' }));
    setEditOpen(false);
  }

  function openDelete(ex: Exercise, evt: React.MouseEvent) {
    evt.stopPropagation();
    setDeleteTarget(ex);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await dispatch(removeExercise({ uid, id: deleteTarget.id }));
    dispatch(showSnackbar({ message: 'Exercise deleted' }));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  return (
    <Box p={2} pb={10}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Exercise Library</Typography>

      {/* Search */}
      <TextField
        fullWidth size="small" placeholder="Search exercises..."
        value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        sx={{ mb: 1.5 }}
      />

      {/* Category filter */}
      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} mb={2}>
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

      {/* Exercise list */}
      {filtered.length === 0 ? (
        <Alert severity="info">No exercises found. Try a different search or filter.</Alert>
      ) : (
        <List disablePadding>
          {filtered.map(ex => (
            <ListItemButton
              key={ex.id}
              onClick={() => openEdit(ex)}
              sx={{ borderRadius: 1, mb: 0.5, pr: 6 }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body1">{ex.name}</Typography>
                    {ex.isCustom && <Chip label="custom" size="small" variant="outlined" />}
                  </Stack>
                }
                secondary={
                  <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                    <Chip
                      label={ex.category} size="small"
                      color={CATEGORY_COLORS[ex.category]}
                    />
                    {ex.equipment && (
                      <Chip label={ex.equipment} size="small" variant="outlined" />
                    )}
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end" size="small"
                  onClick={() => openEdit(ex)}
                  sx={{ mr: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end" size="small" color="error"
                  onClick={e => openDelete(ex, e)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItemButton>
          ))}
        </List>
      )}

      {/* FAB create */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={openCreate}
      >
        <Add />
      </Fab>

      {/* Edit / Create Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{isNew ? 'New Exercise' : 'Edit Exercise'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              autoFocus
              label="Name"
              value={editState.name}
              onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editState.category}
                label="Category"
                onChange={e => setEditState(s => ({ ...s, category: e.target.value as ExerciseCategory }))}
              >
                {CATEGORIES.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Equipment (optional)</InputLabel>
              <Select
                value={editState.equipment}
                label="Equipment (optional)"
                onChange={e => setEditState(s => ({ ...s, equipment: e.target.value as Equipment | '' }))}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {EQUIPMENT_OPTIONS.map(eq => (
                  <MenuItem key={eq} value={eq}>{eq}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Notes (optional)"
              value={editState.notes}
              onChange={e => setEditState(s => ({ ...s, notes: e.target.value }))}
              fullWidth multiline rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!editState.name.trim()}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Exercise</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
