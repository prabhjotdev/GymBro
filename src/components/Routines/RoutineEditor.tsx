import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, Chip,
  Alert,
} from '@mui/material';
import { Add, Delete, ArrowUpward, ArrowDownward, Save } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectExerciseList, selectUid } from '../../store/selectors';
import { saveRoutineExercises } from '../../store/slices/routinesSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import type { RoutineExercise } from '../../types';
import { generateId } from '../../utils';

export function RoutineEditor() {
  const params        = useParams<{ routineId: string }>();
  const routineId     = params.routineId ?? '';
  const navigate      = useNavigate();
  const dispatch      = useAppDispatch();
  const uid           = useAppSelector(selectUid)!;
  const exercises     = useAppSelector(selectExerciseList);
  const routine       = useAppSelector(s => routineId ? s.routines.items[routineId] : undefined);
  const storedREs     = useAppSelector(s =>
    Object.values(s.routines.routineExercises)
      .filter(re => re.routineId === routineId)
      .sort((a, b) => a.order - b.order)
  );

  const [localREs, setLocalREs] = useState<RoutineExercise[]>(storedREs);
  const [addOpen, setAddOpen]   = useState(false);
  const [selEx, setSelEx]       = useState('');

  // Config dialog
  const [configOpen, setConfigOpen]   = useState(false);
  const [configTarget, setConfigTarget] = useState<RoutineExercise | null>(null);
  const [cfgSets, setCfgSets]   = useState(3);
  const [cfgRepMin, setCfgRepMin] = useState(8);
  const [cfgRepMax, setCfgRepMax] = useState(12);
  const [cfgRest, setCfgRest]   = useState(90);

  if (!routine || !routineId) {
    return <Box p={2}><Alert severity="error">Routine not found</Alert></Box>;
  }

  function openConfig(re: RoutineExercise) {
    setConfigTarget(re);
    setCfgSets(re.defaultSets);
    setCfgRepMin(re.repMin);
    setCfgRepMax(re.repMax);
    setCfgRest(re.restSeconds);
    setConfigOpen(true);
  }

  function saveConfig() {
    if (!configTarget) return;
    setLocalREs(prev => prev.map(re =>
      re.id === configTarget.id
        ? { ...re, defaultSets: cfgSets, repMin: cfgRepMin, repMax: cfgRepMax, restSeconds: cfgRest }
        : re
    ));
    setConfigOpen(false);
  }

  function handleAddExercise() {
    if (!selEx) return;
    const newRE: RoutineExercise = {
      id:           `${routineId}_${selEx}_${generateId()}`,
      routineId:    routineId,
      exerciseId:   selEx,
      order:        localREs.length,
      defaultSets:  3,
      repMin:       8,
      repMax:       12,
      restSeconds:  90,
    };
    setLocalREs(prev => [...prev, newRE]);
    setAddOpen(false);
    setSelEx('');
  }

  function handleMove(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= localREs.length) return;
    const updated = [...localREs];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    setLocalREs(updated.map((re, i) => ({ ...re, order: i })));
  }

  function handleDelete(id: string) {
    setLocalREs(prev => prev.filter(re => re.id !== id).map((re, i) => ({ ...re, order: i })));
  }

  async function handleSave() {
    await dispatch(saveRoutineExercises({ uid, routineId, exercises: localREs }));
    dispatch(showSnackbar({ message: 'Routine saved!' }));
    navigate('/routines');
  }

  return (
    <Box p={2} pb={10}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{routine.name}</Typography>
          {routine.description && (
            <Typography variant="body2" color="text.secondary">{routine.description}</Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave}>Save</Button>
      </Stack>

      <Stack spacing={1.5}>
        {localREs.map((re, idx) => {
          const ex = exercises.find(e => e.id === re.exerciseId);
          return (
            <Card key={re.id} elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {/* Move buttons */}
                  <Stack>
                    <IconButton size="small" onClick={() => handleMove(idx, -1)} disabled={idx === 0}>
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleMove(idx, 1)} disabled={idx === localREs.length - 1}>
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </Stack>

                  {/* Exercise info */}
                  <Box flex={1} onClick={() => openConfig(re)} sx={{ cursor: 'pointer' }}>
                    <Typography variant="body1" fontWeight={600}>{ex?.name ?? re.exerciseId}</Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      <Chip label={`${re.defaultSets} sets`} size="small" />
                      <Chip label={`${re.repMin}–${re.repMax} reps`} size="small" />
                      <Chip label={`${re.restSeconds}s rest`} size="small" />
                    </Stack>
                  </Box>

                  <IconButton size="small" color="error" onClick={() => handleDelete(re.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Button
        variant="outlined" startIcon={<Add />} fullWidth
        sx={{ mt: 2, borderRadius: 2, py: 1.5 }}
        onClick={() => setAddOpen(true)}
      >
        Add Exercise
      </Button>

      {/* Add Exercise Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Exercise</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Exercise</InputLabel>
            <Select value={selEx} label="Exercise" onChange={e => setSelEx(e.target.value)}>
              {exercises.map(e => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                    ({e.category})
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddExercise} disabled={!selEx}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Configure Exercise</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Default Sets" type="number" value={cfgSets}
              onChange={e => setCfgSets(+e.target.value)} inputProps={{ min: 1, max: 10 }} />
            <Stack direction="row" spacing={1}>
              <TextField label="Min Reps" type="number" value={cfgRepMin}
                onChange={e => setCfgRepMin(+e.target.value)} inputProps={{ min: 1 }} />
              <TextField label="Max Reps" type="number" value={cfgRepMax}
                onChange={e => setCfgRepMax(+e.target.value)} inputProps={{ min: 1 }} />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Rest Time</InputLabel>
              <Select value={cfgRest} label="Rest Time" onChange={e => setCfgRest(+e.target.value)}>
                {[30, 45, 60, 90, 120, 180].map(s => (
                  <MenuItem key={s} value={s}>{s}s ({Math.floor(s/60)}:{(s%60).toString().padStart(2,'0')})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveConfig}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
