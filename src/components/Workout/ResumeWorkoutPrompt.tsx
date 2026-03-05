import { useNavigate } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { selectDraft } from '../../store/selectors';
import { useLocation } from 'react-router-dom';

export function ResumeWorkoutPrompt() {
  const draft    = useAppSelector(selectDraft);
  const navigate = useNavigate();
  const location = useLocation();

  if (!draft || location.pathname === '/workout/current') return null;

  return (
    <Alert
      severity="info"
      action={
        <Button color="inherit" size="small" onClick={() => navigate('/workout/current')}>
          Resume
        </Button>
      }
      sx={{ borderRadius: 0 }}
    >
      Workout in progress — tap to resume
    </Alert>
  );
}
