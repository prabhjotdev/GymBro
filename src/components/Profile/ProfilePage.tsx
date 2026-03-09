import { useRef, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Divider, Alert, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Save, Info, Logout, Download, Upload, DeleteForever } from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectUid } from '../../store/selectors';
import { updateProfile, fetchProfile } from '../../store/slices/profileSlice';
import { fetchExercises } from '../../store/slices/exercisesSlice';
import { fetchRoutines } from '../../store/slices/routinesSlice';
import { fetchSchedule } from '../../store/slices/scheduleSlice';
import { fetchSessions } from '../../store/slices/sessionsSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import type { ActivityLevel, Goal, UserProfile } from '../../types';
import { calcCalories } from '../../utils';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../../constants/profileOptions';
import {
  exportUserData, importUserData, deleteAllUserData,
  type GymBroExport,
} from '../../firebase/dataLayer';

// Inner form — only rendered once `stored` is guaranteed non-null,
// so useState can be initialized directly without a syncing useEffect.
function ProfileForm({ stored, uid }: { stored: UserProfile; uid: string }) {
  const dispatch = useAppDispatch();

  const [age,           setAge]           = useState<number | ''>(stored.age ?? '');
  const [heightCm,      setHeightCm]      = useState<number | ''>(stored.heightCm ?? '');
  const [weightKg,      setWeightKg]      = useState<number | ''>(stored.weightKg ?? '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(stored.activityLevel ?? 'moderate');
  const [goal,          setGoal]          = useState<Goal>(stored.goal ?? 'maintain');

  const [dmBusy,        setDmBusy]        = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [importOpen,    setImportOpen]    = useState(false);
  const [pendingImport, setPendingImport] = useState<GymBroExport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function reloadData() {
    await Promise.all([
      dispatch(fetchProfile(uid)),
      dispatch(fetchExercises(uid)),
      dispatch(fetchRoutines(uid)),
      dispatch(fetchSchedule(uid)),
      dispatch(fetchSessions(uid)),
    ]);
  }

  async function handleExport() {
    setDmBusy(true);
    try {
      const data = await exportUserData(uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymbro-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(showSnackbar({ message: 'Data exported!' }));
    } catch {
      dispatch(showSnackbar({ message: 'Export failed', severity: 'error' }));
    } finally {
      setDmBusy(false);
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target!.result as string) as GymBroExport;
        if (parsed.version !== 1 || !parsed.data?.profile) throw new Error('Invalid format');
        setPendingImport(parsed);
        setImportOpen(true);
      } catch {
        dispatch(showSnackbar({ message: 'Invalid export file', severity: 'error' }));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (!pendingImport) return;
    setImportOpen(false);
    setDmBusy(true);
    try {
      await importUserData(uid, pendingImport);
      await reloadData();
      dispatch(showSnackbar({ message: 'Data imported successfully!' }));
    } catch {
      dispatch(showSnackbar({ message: 'Import failed', severity: 'error' }));
    } finally {
      setDmBusy(false);
      setPendingImport(null);
    }
  }

  async function handleConfirmDelete() {
    setDeleteOpen(false);
    setDmBusy(true);
    try {
      await deleteAllUserData(uid);
      localStorage.removeItem('gymbro_workout_draft');
      await reloadData();
      dispatch(showSnackbar({ message: 'All data deleted' }));
    } catch {
      dispatch(showSnackbar({ message: 'Delete failed', severity: 'error' }));
    } finally {
      setDmBusy(false);
    }
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
        <Card sx={{ borderRadius: 3, mb: 3 }} elevation={2}>
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
        <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
          Fill in your stats above to see calorie and protein recommendations.
        </Alert>
      )}

      {/* Data Management */}
      <Card sx={{ borderRadius: 3, mb: 3 }} elevation={2}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Data Management</Typography>
          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={dmBusy ? <CircularProgress size={16} /> : <Download />}
              onClick={handleExport}
              disabled={dmBusy}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Export Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              disabled={dmBusy}
              fullWidth
              sx={{ borderRadius: 2 }}
              onClick={() => fileInputRef.current?.click()}
            >
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              hidden
              onChange={handleImportFile}
            />
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForever />}
              onClick={() => setDeleteOpen(true)}
              disabled={dmBusy}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Delete All Data
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete All Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all your workouts, routines, exercises, and profile data.
            Default data will be restored and the setup wizard will appear. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete Everything
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import confirmation dialog */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)}>
        <DialogTitle>Import Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace all current data with the imported file. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmImport}>Import</Button>
        </DialogActions>
      </Dialog>
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
