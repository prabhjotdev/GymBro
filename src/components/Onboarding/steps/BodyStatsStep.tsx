import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, TextField, ToggleButtonGroup, ToggleButton,
} from '@mui/material';

interface BodyStatsData {
  age: number | '';
  heightCm: number | '';
  weightKg: number | '';
}

interface Props {
  data: BodyStatsData;
  onChange: (data: BodyStatsData) => void;
}

type UnitSystem = 'metric' | 'imperial';

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function BodyStatsStep({ data, onChange }: Props) {
  const [units, setUnits] = useState<UnitSystem>('metric');

  // Imperial display state
  const [feet,   setFeet]   = useState<number | ''>('');
  const [inches, setInches] = useState<number | ''>('');
  const [lbs,    setLbs]    = useState<number | ''>('');

  // Sync imperial display from metric parent values when switching to imperial
  function switchToImperial() {
    if (data.heightCm !== '') {
      const totalInches = data.heightCm / 2.54;
      setFeet(Math.floor(totalInches / 12));
      setInches(round1(totalInches % 12));
    }
    if (data.weightKg !== '') {
      setLbs(round1(data.weightKg / 0.453592));
    }
    setUnits('imperial');
  }

  function switchToMetric() {
    // Convert current imperial display back to metric fields
    if (feet !== '' || inches !== '') {
      const cm = round1((feet !== '' ? +feet : 0) * 30.48 + (inches !== '' ? +inches : 0) * 2.54);
      onChange({ ...data, heightCm: cm || '' });
    }
    if (lbs !== '') {
      const kg = round1(+lbs * 0.453592);
      onChange({ ...data, weightKg: kg || '' });
    }
    setUnits('metric');
  }

  function handleUnitToggle(_: React.MouseEvent<HTMLElement>, next: UnitSystem | null) {
    if (!next || next === units) return;
    if (next === 'imperial') switchToImperial();
    else switchToMetric();
  }

  // When imperial height fields change, convert to cm and propagate up
  function handleFeetChange(val: number | '') {
    setFeet(val);
    const cm = round1((val !== '' ? +val : 0) * 30.48 + (inches !== '' ? +inches : 0) * 2.54);
    onChange({ ...data, heightCm: cm || '' });
  }

  function handleInchesChange(val: number | '') {
    setInches(val);
    const cm = round1((feet !== '' ? +feet : 0) * 30.48 + (val !== '' ? +val : 0) * 2.54);
    onChange({ ...data, heightCm: cm || '' });
  }

  function handleLbsChange(val: number | '') {
    setLbs(val);
    const kg = val !== '' ? round1(+val * 0.453592) : '';
    onChange({ ...data, weightKg: kg });
  }

  return (
    <Box pt={1}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Body Stats
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Used to calculate your daily calorie and protein targets. All fields are optional.
      </Typography>

      <Stack spacing={3}>
        {/* Unit toggle */}
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Units
          </Typography>
          <ToggleButtonGroup
            value={units}
            exclusive
            onChange={handleUnitToggle}
            size="small"
            fullWidth
          >
            <ToggleButton value="metric">Metric (cm / kg)</ToggleButton>
            <ToggleButton value="imperial">Imperial (ft / lbs)</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Age — same for both unit systems */}
        <TextField
          label="Age"
          type="number"
          value={data.age}
          fullWidth
          onChange={e => onChange({ ...data, age: e.target.value === '' ? '' : +e.target.value })}
          inputProps={{ min: 10, max: 100 }}
          helperText="Years (10–100)"
        />

        {/* Height */}
        {units === 'metric' ? (
          <TextField
            label="Height (cm)"
            type="number"
            value={data.heightCm}
            fullWidth
            onChange={e => onChange({ ...data, heightCm: e.target.value === '' ? '' : +e.target.value })}
            inputProps={{ min: 50, max: 300 }}
            helperText="Centimetres (50–300)"
          />
        ) : (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Height
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Feet"
                type="number"
                value={feet}
                fullWidth
                onChange={e => handleFeetChange(e.target.value === '' ? '' : +e.target.value)}
                inputProps={{ min: 1, max: 8 }}
              />
              <TextField
                label="Inches"
                type="number"
                value={inches}
                fullWidth
                onChange={e => handleInchesChange(e.target.value === '' ? '' : +e.target.value)}
                inputProps={{ min: 0, max: 11, step: 0.5 }}
              />
            </Stack>
          </Box>
        )}

        {/* Weight */}
        {units === 'metric' ? (
          <TextField
            label="Weight (kg)"
            type="number"
            value={data.weightKg}
            fullWidth
            onChange={e => onChange({ ...data, weightKg: e.target.value === '' ? '' : +e.target.value })}
            inputProps={{ min: 20, max: 300, step: 0.5 }}
            helperText="Kilograms"
          />
        ) : (
          <TextField
            label="Weight (lbs)"
            type="number"
            value={lbs}
            fullWidth
            onChange={e => handleLbsChange(e.target.value === '' ? '' : +e.target.value)}
            inputProps={{ min: 44, max: 660, step: 1 }}
            helperText="Pounds"
          />
        )}
      </Stack>
    </Box>
  );
}
