import {
  TableRow, TableCell, TextField, Checkbox,
  IconButton, Chip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { DraftSet } from '../../types';

interface Props {
  set:      DraftSet;
  lastWeight?: number;
  lastReps?:   number;
  onChange: (patch: Partial<DraftSet>) => void;
  onDelete: () => void;
}

export function SetRow({ set, lastWeight, lastReps, onChange, onDelete }: Props) {
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
