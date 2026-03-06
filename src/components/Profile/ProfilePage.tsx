import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Divider, Alert, Chip,
} from '@mui/material';
import { Save, Info, Logout } from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectUid } from '../../store/selectors';
import { updateProfile } from '../../store/slices/profileSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import type { ActivityLevel, Goal, UserProfile } from '../../types';
import { calcCalories } from '../../utils';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary',  label: 'Sedentary (desk job, no exercise)' },
  { value: 'light',      label: 'Light (1–3 days/week)' },
  { value: 'moderate',   label: 'Moderate (3–5 days/week)' },
  { value: 'active',     label: 'Active (6–7 days/week)' },
  { value: 'veryActive', label: 'Very Active (athlete / hard labor)' },
];

const GOAL_OPTIONS: { value: Goal; label: string; color: 'error' | 'success' | 'info' }[] = [
  { value: 'cut',      label: 'Cut (lose fat)',      color: 'error'   },
  { value: 'maintain', label: 'Maintain weight',     color: 'info'    },
  { value: 'bulk',     label: 'Bulk (build muscle)', color: 'success' },
];

// Inner form — only rendered once `stored` is guaranteed non-null,
// so useState can be initialized directly without a syncing useEffect.
function ProfileForm({ stored, uid }: { stored: UserProfile; uid: string }) {
  const dispatch = useAppDispatch();

  const [age,           setAge]           = useState<number | ''>(stored.age ?? '');
  const [heightCm,      setHeightCm]      = useState<number | ''>(stored.heightCm ?? '');
  const [weightKg,      setWeightKg]      = useState<number | ''>(stored.weightKg ?? '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(stored.activityLevel ?? 'moderate');
  const [goal,          setGoal]          = useState<Goal>(stored.goal ?? 'maintain');

  const partial: Partial<UserProfile> = {
    age:      age      !== '' ? +age      : undefined,
    heightCm: heightCm !== '' ? +heightCm : undefined,
    weightKg: weightKg !== '' ? +weightKg : undefined,
    activityLevel, goal,
  };

  const recs = calcCalories(partial);

  async function handleSave() {
    await dispatch(updateProfile({ uid, data: { ...partial, updatedAt: Date.now() } }));
    dispatch(showSnackbar({ message: 'Profile saved!' }));
  }

  return (
    <>
      <Card sx={{ borderRadius: 3, mb: 3 }} elevation={2}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Body Stats</Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Age" type="number" value={age} fullWidth
                onChange={e => setAge(e.target.value === '' ? '' : +e.target.value)}
                inputProps={{ min: 10, max: 100 }}
              />
              <TextField
                label="Weight (kg)" type="number" value={weightKg} fullWidth
                onChange={e => setWeightKg(e.target.value === '' ? '' : +e.target.value)}
                inputProps={{ min: 20, step: 0.5 }}
              />
            </Stack>
            <TextField
              label="Height (cm)" type="number" value={heightCm} fullWidth
              onChange={e => setHeightCm(e.target.value === '' ? '' : +e.target.value)}
              inputProps={{ min: 50, max: 300 }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, mb: 3 }} elevation={2}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Activity & Goal</Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Activity Level</InputLabel>
              <Select
                value={activityLevel}
                label="Activity Level"
                onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
              >
                {ACTIVITY_OPTIONS.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1}>
              {GOAL_OPTIONS.map(o => (
                <Chip
                  key={o.value}
                  label={o.label}
                  color={goal === o.value ? o.color : 'default'}
                  onClick={() => setGoal(o.value)}
                  sx={{ flex: 1 }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2} mb={3}>
        <Button
          variant="contained" size="large" startIcon={<Save />} fullWidth
          onClick={handleSave}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          Save Profile
        </Button>
        <Button
          variant="outlined" size="large" startIcon={<Logout />}
          onClick={() => signOut(auth)}
          color="error"
          sx={{ borderRadius: 2, py: 1.5, minWidth: 120 }}
        >
          Sign Out
        </Button>
      </Stack>

      {/* Recommendations */}
      {recs ? (
        <Card sx={{ borderRadius: 3 }} elevation={2}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Info color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>Calorie Estimates</Typography>
            </Stack>

            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Maintenance</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {recs.maintenanceLow}–{recs.maintenanceHigh} kcal/day
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Goal ({goal})
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {recs.goalLow}–{recs.goalHigh} kcal/day
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Protein</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {recs.proteinLow}–{recs.proteinHigh} g/day
                </Typography>
              </Box>
            </Stack>

            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              Estimates only; not medical advice. Consult a qualified professional for personalised guidance.
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Fill in your stats above to see calorie and protein recommendations.
        </Alert>
      )}
    </>
  );
}

export function ProfilePage() {
  const uid    = useAppSelector(selectUid)!;
  const stored = useAppSelector(s => s.profile.data);

  return (
    <Box p={2} pb={4}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Profile</Typography>
      {stored && <ProfileForm stored={stored} uid={uid} />}
      <Typography
        variant="caption"
        color="text.disabled"
        align="center"
        display="block"
        mt={4}
      >
        Version {__APP_VERSION__}
      </Typography>
    </Box>
  );
}
