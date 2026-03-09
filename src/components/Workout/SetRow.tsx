import {
  TableRow, TableCell, TextField, Checkbox,
  IconButton, Chip, Select, MenuItem,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { DraftSet } from '../../types';

interface Props {
  set:         DraftSet;
  lastWeight?: number;
  lastReps?:   number;
  isCardio?:   boolean;
  onChange: (patch: Partial<DraftSet>) => void;
  onDelete: () => void;
}

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const HOUR_OPTIONS   = [0, 1, 2, 3, 4, 5];

export function SetRow({ set, lastWeight, lastReps, isCardio, onChange, onDelete }: Props) {
  if (isCardio) {
    const totalMins = set.durationMinutes ?? 30;
    const hours     = Math.floor(totalMins / 60);
    const mins      = totalMins % 60;

    function handleHoursChange(h: number) {
      onChange({ durationMinutes: h * 60 + mins });
    }
    function handleMinsChange(m: number) {
      onChange({ durationMinutes: hours * 60 + m });
    }

    return (
      <TableRow
        sx={{
          bgcolor: set.done ? 'action.selected' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      >
        {/* Set index */}
        <TableCell sx={{ py: 0.5, pl: 1, width: 28 }}>
          <Chip label={set.setIndex + 1} size="small" />
        </TableCell>

        {/* Hours */}
        <TableCell sx={{ py: 0.5, width: 80 }}>
          <Select
            size="small"
            value={hours}
            onChange={e => handleHoursChange(Number(e.target.value))}
            sx={{ minWidth: 64, '& .MuiSelect-select': { py: '6px', px: '8px' } }}
          >
            {HOUR_OPTIONS.map(h => (
              <MenuItem key={h} value={h}>{h}h</MenuItem>
            ))}
          </Select>
        </TableCell>

        {/* Minutes */}
        <TableCell sx={{ py: 0.5, width: 80 }}>
          <Select
            size="small"
            value={mins}
            onChange={e => handleMinsChange(Number(e.target.value))}
            sx={{ minWidth: 64, '& .MuiSelect-select': { py: '6px', px: '8px' } }}
          >
            {MINUTE_OPTIONS.map(m => (
              <MenuItem key={m} value={m}>{m}m</MenuItem>
            ))}
          </Select>
        </TableCell>

        {/* Done checkbox */}
        <TableCell sx={{ py: 0.5, width: 44 }}>
          <Checkbox
            checked={set.done}
            onChange={e => onChange({ done: e.target.checked })}
            color="success"
            sx={{ p: 0.5 }}
          />
        </TableCell>

        {/* Delete */}
        <TableCell sx={{ py: 0.5, pr: 0.5, width: 36 }}>
          <IconButton size="small" color="error" onClick={onDelete}>
            <Delete fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      sx={{
        bgcolor: set.done ? 'action.selected' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      {/* Set index */}
      <TableCell sx={{ py: 0.5, pl: 1, width: 28 }}>
        {set.isWarmup
          ? <Chip label="W" size="small" color="warning" />
          : <Chip label={set.setIndex + 1} size="small" />
        }
      </TableCell>

      {/* Weight */}
      <TableCell sx={{ py: 0.5, width: 80 }}>
        <TextField
          size="small"
          type="number"
          value={set.weight || ''}
          placeholder={lastWeight ? `${lastWeight}` : '0'}
          onChange={e => onChange({ weight: parseFloat(e.target.value) || 0 })}
          inputProps={{ min: 0, step: 2.5 }}
          sx={{ '& input': { textAlign: 'center', p: '6px 4px' } }}
        />
      </TableCell>

      {/* Reps */}
      <TableCell sx={{ py: 0.5, width: 70 }}>
        <TextField
          size="small"
          type="number"
          value={set.reps || ''}
          placeholder={lastReps ? `${lastReps}` : '0'}
          onChange={e => onChange({ reps: parseInt(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
          sx={{ '& input': { textAlign: 'center', p: '6px 4px' } }}
        />
      </TableCell>

      {/* Done checkbox */}
      <TableCell sx={{ py: 0.5, width: 44 }}>
        <Checkbox
          checked={set.done}
          onChange={e => onChange({ done: e.target.checked })}
          color="success"
          sx={{ p: 0.5 }}
        />
      </TableCell>

      {/* Delete */}
      <TableCell sx={{ py: 0.5, pr: 0.5, width: 36 }}>
        <IconButton size="small" color="error" onClick={onDelete}>
          <Delete fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
