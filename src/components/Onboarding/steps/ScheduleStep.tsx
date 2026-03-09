import {
  Box, Typography, Stack, FormControl, Select, MenuItem, Chip,
} from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import { selectRoutineList } from '../../../store/selectors';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  schedule: Record<number, string>; // dayOfWeek → routineId | ''
  onChange: (schedule: Record<number, string>) => void;
}

export function ScheduleStep({ schedule, onChange }: Props) {
  const routines = useAppSelector(selectRoutineList);

  function handleDayChange(day: number, routineId: string) {
    onChange({ ...schedule, [day]: routineId });
  }

  const assignedCount = Object.values(schedule).filter(Boolean).length;

  return (
    <Box pt={1}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Weekly Schedule
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        Assign routines to days. You can always change this later on the Schedule page.
      </Typography>
      {assignedCount > 0 && (
        <Chip
          label={`${assignedCount} day${assignedCount !== 1 ? 's' : ''} scheduled`}
          color="primary"
          size="small"
          sx={{ mb: 2 }}
        />
      )}

      <Stack spacing={1.5} mt={assignedCount === 0 ? 2 : 0}>
        {DAY_NAMES.map((name, day) => (
          <Stack key={day} direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ width: 100, flexShrink: 0, color: day === new Date().getDay() ? 'primary.main' : 'text.primary' }}
            >
              {name}
              {day === new Date().getDay() && (
                <Typography component="span" variant="caption" color="primary.main" ml={0.5}>
                  (today)
                </Typography>
              )}
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={schedule[day] ?? ''}
                onChange={e => handleDayChange(day, e.target.value)}
                displayEmpty
              >
                <MenuItem value=""><em>Rest</em></MenuItem>
                {routines.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
