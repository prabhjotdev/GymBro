import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectRoutineList, selectUid } from '../../store/selectors';
import { upsertScheduleDay, deleteScheduleDay } from '../../store/slices/scheduleSlice';
import type { DayOfWeek, ScheduleTemplate } from '../../types';
import { DAY_NAMES, DAY_NAMES_SHORT } from '../../utils';

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export function SchedulePage() {
  const dispatch  = useAppDispatch();
  const uid       = useAppSelector(selectUid)!;
  const routines  = useAppSelector(selectRoutineList);
  const schedule  = useAppSelector(s => s.schedule.items);
  const today     = new Date().getDay() as DayOfWeek;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDay, setEditDay]       = useState<DayOfWeek | null>(null);
  const [selRoutine, setSelRoutine] = useState('');

  function openAdd(day: DayOfWeek) {
    const existing = schedule[day];
    setEditDay(day);
    setSelRoutine(existing?.routineId ?? '');
    setDialogOpen(true);
  }

  function handleSave() {
    if (editDay === null || !selRoutine) return;
    const existing = schedule[editDay];
    const item: ScheduleTemplate = {
      id:        existing?.id ?? `day_${editDay}`,
      dayOfWeek: editDay,
      routineId: selRoutine,
    };
    dispatch(upsertScheduleDay({ uid, item }));
    setDialogOpen(false);
  }

  function handleDelete(day: DayOfWeek) {
    const item = schedule[day];
    if (!item) return;
    dispatch(deleteScheduleDay({ uid, id: item.id, dayOfWeek: day }));
  }

  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Weekly Schedule</Typography>
      <Typography color="text.secondary" mb={2} variant="body2">
        Tap a day to assign or change its routine.
      </Typography>

      <Stack spacing={1.5}>
        {ALL_DAYS.map(day => {
          const slot    = schedule[day];
          const routine = slot ? routines.find(r => r.id === slot.routineId) : null;
          const isToday = day === today;

          return (
            <Card
              key={day}
              elevation={isToday ? 4 : 1}
              sx={{
                borderRadius: 2,
                border: isToday ? '2px solid' : '1px solid transparent',
                borderColor: isToday ? 'primary.main' : 'transparent',
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 40, height: 40, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: isToday ? 'primary.main' : 'action.hover',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color={isToday ? 'white' : 'text.primary'}
                      >
                        {DAY_NAMES_SHORT[day]}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={isToday ? 700 : 400}>
                        {DAY_NAMES[day]}
                        {isToday && <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />}
                      </Typography>
                      {routine ? (
                        <Typography variant="caption" color="text.secondary">{routine.name}</Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">Rest Day</Typography>
                      )}
                    </Box>
                  </Stack>

                  <Stack direction="row">
                    <IconButton size="small" onClick={() => openAdd(day)}>
                      {routine ? <Edit fontSize="small" /> : <Add fontSize="small" />}
                    </IconButton>
                    {routine && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(day)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editDay !== null ? DAY_NAMES[editDay] : ''}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Routine</InputLabel>
            <Select
              value={selRoutine}
              label="Routine"
              onChange={e => setSelRoutine(e.target.value)}
            >
              {routines.map(r => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!selRoutine}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
