import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea,
  Stack, Chip, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, IconButton, Menu, MenuItem,
} from '@mui/material';
import { Add, FitnessCenter, MoreVert, LibraryBooks } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectRoutineList, selectUid } from '../../store/selectors';
import { upsertRoutine, removeRoutine } from '../../store/slices/routinesSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { generateId } from '../../utils';
import type { Routine } from '../../types';

export function RoutinesPage() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const uid       = useAppSelector(selectUid)!;
  const routines  = useAppSelector(selectRoutineList);
  const allREs    = useAppSelector(s => s.routines.routineExercises);

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName]             = useState('');
  const [desc, setDesc]             = useState('');

  // Three-dot menu
  const [menuAnchor, setMenuAnchor]       = useState<null | HTMLElement>(null);
  const [menuRoutineId, setMenuRoutineId] = useState<string | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen]       = useState(false);
  const [editRoutineId, setEditRoutineId] = useState<string | null>(null);
  const [editName, setEditName]       = useState('');
  const [editDesc, setEditDesc]       = useState('');

  // Delete dialog
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

  function exerciseCount(routineId: string): number {
    return Object.values(allREs).filter(re => re.routineId === routineId).length;
  }

  function handleCreate() {
    if (!name.trim()) return;
    const routine: Routine = {
      id: generateId(), name: name.trim(), description: desc.trim(),
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    dispatch(upsertRoutine({ uid, routine }));
    setDialogOpen(false);
    setName(''); setDesc('');
    navigate(`/routines/${routine.id}`);
  }

  function openMenu(e: React.MouseEvent<HTMLElement>, routineId: string) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuRoutineId(routineId);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuRoutineId(null);
  }

  function openEdit() {
    const routine = routines.find(r => r.id === menuRoutineId);
    if (!routine) return;
    setEditRoutineId(routine.id);
    setEditName(routine.name);
    setEditDesc(routine.description ?? '');
    setEditOpen(true);
    closeMenu();
  }

  function handleEdit() {
    if (!editRoutineId || !editName.trim()) return;
    const existing = routines.find(r => r.id === editRoutineId);
    if (!existing) return;
    dispatch(upsertRoutine({ uid, routine: { ...existing, name: editName.trim(), description: editDesc.trim(), updatedAt: Date.now() } }));
    dispatch(showSnackbar({ message: 'Routine updated!' }));
    setEditOpen(false);
  }

  function openDelete() {
    setDeleteRoutineId(menuRoutineId);
    setDeleteOpen(true);
    closeMenu();
  }

  function handleDelete() {
    if (!deleteRoutineId) return;
    dispatch(removeRoutine({ uid, id: deleteRoutineId }));
    dispatch(showSnackbar({ message: 'Routine deleted' }));
    setDeleteOpen(false);
    setDeleteRoutineId(null);
  }

  return (
    <Box p={2} pb={10}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h5" fontWeight={700}>Routines</Typography>
        <Button
          startIcon={<LibraryBooks />}
          size="small"
          onClick={() => navigate('/exercises')}
        >
          Exercise Library
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        {routines.map(r => (
          <Card key={r.id} elevation={2} sx={{ borderRadius: 2 }}>
            <Stack direction="row" alignItems="center">
              <CardActionArea onClick={() => navigate(`/routines/${r.id}`)} sx={{ flex: 1 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{r.name}</Typography>
                      {r.description && (
                        <Typography variant="caption" color="text.secondary">{r.description}</Typography>
                      )}
                    </Box>
                    <Chip
                      icon={<FitnessCenter />}
                      label={`${exerciseCount(r.id)} exercises`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <IconButton onClick={e => openMenu(e, r.id)} sx={{ mr: 1 }}>
                <MoreVert />
              </IconButton>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Three-dot Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={openEdit}>Edit</MenuItem>
        <MenuItem onClick={openDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Routine</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Name" value={name}
            onChange={e => setName(e.target.value)} sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth label="Description (optional)" value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Routine</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Name" value={editName}
            onChange={e => setEditName(e.target.value)} sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth label="Description (optional)" value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit} disabled={!editName.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Routine</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{routines.find(r => r.id === deleteRoutineId)?.name}"? This cannot be undone.
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
