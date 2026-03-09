import {
  Box, Typography, Stack, FormControl, InputLabel, Select, MenuItem, Chip,
} from '@mui/material';
import type { ActivityLevel, Goal } from '../../../types';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../../../constants/profileOptions';

interface GoalData {
  activityLevel: ActivityLevel;
  goal: Goal;
}

interface Props {
  data: GoalData;
  onChange: (data: GoalData) => void;
}

export function GoalStep({ data, onChange }: Props) {
  return (
    <Box pt={1}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Activity & Goal
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        These refine your calorie estimates and help track progress toward your goal.
      </Typography>

      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel>Activity Level</InputLabel>
          <Select
            value={data.activityLevel}
            label="Activity Level"
            onChange={e => onChange({ ...data, activityLevel: e.target.value as ActivityLevel })}
          >
            {ACTIVITY_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Fitness Goal
          </Typography>
          <Stack direction="row" spacing={1}>
            {GOAL_OPTIONS.map(o => (
              <Chip
                key={o.value}
                label={o.label}
                color={data.goal === o.value ? o.color : 'default'}
                onClick={() => onChange({ ...data, goal: o.value })}
                sx={{ flex: 1 }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
