import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Button,
  MobileStepper, useMediaQuery, useTheme, CircularProgress,
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight, Close } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectNeedsOnboarding, selectUid } from '../../store/selectors';
import { updateProfile } from '../../store/slices/profileSlice';
import { upsertScheduleDay, deleteScheduleDay } from '../../store/slices/scheduleSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import type { ActivityLevel, Goal, ScheduleTemplate, DayOfWeek } from '../../types';
import { WelcomeStep } from './steps/WelcomeStep';
import { BodyStatsStep } from './steps/BodyStatsStep';
import { GoalStep } from './steps/GoalStep';
import { ScheduleStep } from './steps/ScheduleStep';

interface WizardData {
  age: number | '';
  heightCm: number | '';
  weightKg: number | '';
  activityLevel: ActivityLevel;
  goal: Goal;
  schedule: Record<number, string>; // dayOfWeek → routineId | ''
}

const STEPS = ['Welcome', 'Body Stats', 'Activity & Goal', 'Schedule'];

export function OnboardingWizard() {
  const dispatch      = useAppDispatch();
  const uid           = useAppSelector(selectUid)!;
  const needsOnboard  = useAppSelector(selectNeedsOnboarding);
  const scheduleItems = useAppSelector(s => s.schedule.items);

  const theme    = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<WizardData>(() => ({
    age: '',
    heightCm: '',
    weightKg: '',
    activityLevel: 'moderate',
    goal: 'maintain',
    // Pre-populate from whatever the seeded schedule already has
    schedule: Object.fromEntries(
      Object.values(scheduleItems).map(s => [s.dayOfWeek, s.routineId])
    ),
  }));

  if (!needsOnboard) return null;

  async function handleSkip() {
    setSaving(true);
    try {
      await dispatch(updateProfile({ uid, data: { onboardingComplete: true, updatedAt: Date.now() } })).unwrap();
    } catch {
      dispatch(showSnackbar({ message: 'Could not save — please try again', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      // Save profile
      await dispatch(updateProfile({
        uid,
        data: {
          age:           data.age      !== '' ? +data.age      : undefined,
          heightCm:      data.heightCm !== '' ? +data.heightCm : undefined,
          weightKg:      data.weightKg !== '' ? +data.weightKg : undefined,
          activityLevel: data.activityLevel,
          goal:          data.goal,
          onboardingComplete: true,
          updatedAt: Date.now(),
        },
      })).unwrap();

      // Save schedule — upsert days with a routine, delete rest days that were previously set
      const scheduleOps = Object.entries(data.schedule).map(([dayStr, routineId]) => {
        const day = +dayStr as DayOfWeek;
        const id  = `day_${day}`;
        if (routineId) {
          return dispatch(upsertScheduleDay({
            uid,
            item: { id, dayOfWeek: day, routineId } as ScheduleTemplate,
          }));
        } else if (scheduleItems[day]) {
          return dispatch(deleteScheduleDay({ uid, id, dayOfWeek: day }));
        }
        return null;
      });
      await Promise.all(scheduleOps.filter(Boolean));

      dispatch(showSnackbar({ message: 'All set! Welcome to GymBro 💪' }));
    } catch {
      dispatch(showSnackbar({ message: 'Could not save — please try again', severity: 'error' }));
      setSaving(false);
    }
    // Note: on success the dialog closes automatically once selectNeedsOnboarding → false
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <Dialog
      open
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Box component="span" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
          Step {step + 1} of {STEPS.length}
        </Box>
        <Button
          size="small"
          color="inherit"
          onClick={handleSkip}
          disabled={saving}
          startIcon={<Close fontSize="small" />}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
        >
          Skip
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 0 }}>
        {step === 0 && <WelcomeStep />}
        {step === 1 && (
          <BodyStatsStep
            data={{ age: data.age, heightCm: data.heightCm, weightKg: data.weightKg }}
            onChange={d => setData(prev => ({ ...prev, ...d }))}
          />
        )}
        {step === 2 && (
          <GoalStep
            data={{ activityLevel: data.activityLevel, goal: data.goal }}
            onChange={d => setData(prev => ({ ...prev, ...d }))}
          />
        )}
        {step === 3 && (
          <ScheduleStep
            schedule={data.schedule}
            onChange={schedule => setData(prev => ({ ...prev, schedule }))}
          />
        )}
      </DialogContent>

      <MobileStepper
        variant="dots"
        steps={STEPS.length}
        activeStep={step}
        position="static"
        sx={{ px: 2, py: 1.5, bgcolor: 'transparent' }}
        backButton={
          <Button
            size="small"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0 || saving}
            startIcon={<KeyboardArrowLeft />}
          >
            Back
          </Button>
        }
        nextButton={
          isLastStep ? (
            <Button
              size="small"
              variant="contained"
              onClick={handleFinish}
              disabled={saving}
              endIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {saving ? 'Saving…' : 'Finish'}
            </Button>
          ) : (
            <Button
              size="small"
              onClick={() => setStep(s => s + 1)}
              disabled={saving}
              endIcon={<KeyboardArrowRight />}
            >
              Next
            </Button>
          )
        }
      />
    </Dialog>
  );
}
