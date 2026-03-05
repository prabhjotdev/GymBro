import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea,
  Stack, Chip, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField,
} from '@mui/material';
import { Add, FitnessCenter } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectRoutineList, selectUid } from '../../store/selectors';
import { upsertRoutine } from '../../store/slices/routinesSlice';
import { generateId } from '../../utils';
import type { Routine } from '../../types';

export function RoutinesPage() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const uid       = useAppSelector(selectUid)!;
  const routines  = useAppSelector(selectRoutineList);
  const allREs    = useAppSelector(s => s.routines.routineExercises);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName]             = useState('');
  const [desc, setDesc]             = useState('');

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

  return (
    <Box p={2} pb={10}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Routines</Typography>

      <Stack spacing={1.5}>
        {routines.map(r => (
          <Card key={r.id} elevation={2} sx={{ borderRadius: 2 }}>
            <CardActionArea onClick={() => navigate(`/routines/${r.id}`)}>
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
    </Box>
  );
}
