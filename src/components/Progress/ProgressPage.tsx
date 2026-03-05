import { useState, useCallback } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, CardActionArea,
  Chip, TextField, InputAdornment, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
  Alert,
} from '@mui/material';
import { Search, EmojiEvents, TrendingUp } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { selectExerciseList, selectUid } from '../../store/selectors';
import { getSessions, getEntriesForSession, getSetsForEntry } from '../../firebase/dataLayer';
import type { Exercise, SetEntry } from '../../types';
import { calcBestSet, estimated1RM, formatDate } from '../../utils';

interface ExerciseHistory {
  sessionDate: number;
  sets: SetEntry[];
}

export function ProgressPage() {
  const uid        = useAppSelector(selectUid)!;
  const exercises  = useAppSelector(selectExerciseList);
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [history, setHistory]   = useState<ExerciseHistory[]>([]);
  const [loading, setLoading]   = useState(false);

  const filtered = exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const loadHistory = useCallback(async (exerciseId: string) => {
    setLoading(true);
    try {
      const sessions = await getSessions(uid, 30);
      const results: ExerciseHistory[] = [];
      for (const session of sessions) {
        if (session.status !== 'completed') continue;
        const entries = await getEntriesForSession(uid, session.id);
        const entry   = entries.find(e => e.exerciseId === exerciseId);
        if (!entry) continue;
        const sets = await getSetsForEntry(uid, entry.id);
        if (sets.length > 0) {
          results.push({ sessionDate: session.date, sets });
        }
      }
      setHistory(results);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  function handleSelect(ex: Exercise) {
    setSelected(ex);
    loadHistory(ex.id);
  }

  // PR stats across all sessions
  const allSets   = history.flatMap(h => h.sets);
  const overallPR = calcBestSet(allSets);

  if (selected) {
    return (
      <Box p={2}>
        <Stack direction="row" alignItems="center" mb={2} spacing={1}>
          <Typography
            variant="body2" color="primary" sx={{ cursor: 'pointer' }}
            onClick={() => { setSelected(null); setHistory([]); }}
          >
            ← Back
          </Typography>
          <Typography variant="body2" color="text.secondary">/ {selected.name}</Typography>
        </Stack>

        <Typography variant="h6" fontWeight={700} mb={1}>{selected.name}</Typography>

        {overallPR && (
          <Card sx={{ borderRadius: 2, mb: 2, bgcolor: 'primary.dark' }} elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <EmojiEvents sx={{ color: 'gold' }} />
                <Typography fontWeight={700} color="white">Personal Record</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800} color="white">
                {overallPR.weight}kg × {overallPR.reps}
              </Typography>
              <Typography color="rgba(255,255,255,0.7)" variant="body2">
                Estimated 1RM: {overallPR.e1rm} kg
              </Typography>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : history.length === 0 ? (
          <Alert severity="info">No history yet. Log a workout to see progress!</Alert>
        ) : (
          <>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              <TrendingUp sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Session History
            </Typography>
            <Stack spacing={1.5}>
              {history.map((h, i) => {
                const best = calcBestSet(h.sets);
                return (
                  <Card key={i} elevation={1} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{formatDate(h.sessionDate)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {h.sets.filter(s => !s.isWarmup).length} working sets
                          </Typography>
                        </Box>
                        {best && (
                          <Box textAlign="right">
                            <Typography variant="body2" fontWeight={700}>
                              {best.weight}kg × {best.reps}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              e1RM: {best.e1rm}kg
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                      <Table size="small" sx={{ mt: 1 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ py: 0.5 }}>Set</TableCell>
                            <TableCell sx={{ py: 0.5 }}>Weight (kg)</TableCell>
                            <TableCell sx={{ py: 0.5 }}>Reps</TableCell>
                            <TableCell sx={{ py: 0.5 }}>e1RM</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {h.sets.map(s => (
                            <TableRow key={s.setIndex}>
                              <TableCell sx={{ py: 0.25 }}>
                                {s.isWarmup ? 'W' : s.setIndex + 1}
                              </TableCell>
                              <TableCell sx={{ py: 0.25 }}>{s.weight}</TableCell>
                              <TableCell sx={{ py: 0.25 }}>{s.reps}</TableCell>
                              <TableCell sx={{ py: 0.25 }}>{estimated1RM(s.weight, s.reps)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Progress</Typography>
      <TextField
        fullWidth size="small" placeholder="Search exercise..."
        value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        sx={{ mb: 2 }}
      />
      <Stack spacing={1}>
        {filtered.map(ex => (
          <Card key={ex.id} elevation={1} sx={{ borderRadius: 2 }}>
            <CardActionArea onClick={() => handleSelect(ex)}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" fontWeight={600}>{ex.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{ex.category}</Typography>
                  </Box>
                  <Chip label={ex.equipment ?? 'n/a'} size="small" variant="outlined" />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
