import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Divider, Alert, Stack, CircularProgress,
} from '@mui/material';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../../firebase/config';

const provider = new GoogleAuthProvider();

export function LoginPage() {
  const [mode, setMode]       = useState<'signin' | 'signup'>('signin');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function clearError() { setError(''); }

  async function handleEmailAuth() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e: unknown) {
      const msg = (e as { message?: string }).message ?? 'Authentication failed.';
      setError(msg.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?$/, ''));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const msg = (e as { message?: string }).message ?? 'Google sign-in failed.';
      setError(msg.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?$/, ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      px={2}
      sx={{ background: 'linear-gradient(135deg, #6C63FF22 0%, #FF658422 100%)' }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, borderRadius: 4 }} elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800} textAlign="center" mb={0.5}>
            GymBro
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              autoComplete="email"
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              fullWidth
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              disabled={loading}
              onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleEmailAuth}
              disabled={loading || !email || !password}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </Stack>

          <Divider sx={{ my: 2.5 }}>or</Divider>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleGoogle}
            disabled={loading}
            sx={{ borderRadius: 2, py: 1.5, textTransform: 'none' }}
            startIcon={
              <Box component="img" src="/google-icon.svg" alt="" width={20} height={20}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            }
          >
            Continue with Google
          </Button>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary" display="inline">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              display="inline"
              sx={{ cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); }}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
