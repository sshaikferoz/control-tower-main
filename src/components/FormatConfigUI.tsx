import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Grid,
  Chip,
  Button as MuiButton,
} from '@mui/material';
import { Button } from 'primereact/button';
import {
  FormatConfig,
  FORMAT_PRESETS,
  applyValueFormat,
  ScaleType,
  RoundingType,
} from '@/lib/utils/format/formatConfig';

interface FormatConfigUIProps {
  value?: FormatConfig;
  onChange: (config: FormatConfig) => void;
  sampleValue?: number; // Optional sample value to show preview
  label?: string;
}

export const FormatConfigUI: React.FC<FormatConfigUIProps> = ({
  value = {},
  onChange,
  sampleValue = 1234567.89,
  label = 'Format Configuration',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<FormatConfig>(value);

  const handleChange = (updates: Partial<FormatConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const applyPreset = (presetName: string) => {
    const preset = FORMAT_PRESETS[presetName];
    if (preset) {
      setConfig(preset);
      onChange(preset);
    }
  };

  const preview = applyValueFormat(sampleValue, config);

  return (
    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#ffffff20', mb: 2, mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
        {label}
      </Typography>

      {/* Presets */}
      <Box mb={2}>
        <Typography variant="caption" sx={{ color: 'white', mb: 1, display: 'block' }}>
          Quick Presets:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {Object.keys(FORMAT_PRESETS).map((presetName) => (
            <Chip
              key={presetName}
              label={presetName}
              onClick={() => applyPreset(presetName)}
              size="small"
              sx={{
                backgroundColor: '#ffffff30',
                color: 'white',
                '&:hover': { backgroundColor: '#ffffff50' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Basic Configuration */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'white' }}>Scale</InputLabel>
            <Select
              value={config.scale || 'none'}
              onChange={(e) => handleChange({ scale: e.target.value as ScaleType })}
              label="Scale"
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '& .MuiSvgIcon-root': { color: 'white' },
              }}
            >
              <MenuItem value="none">None (1)</MenuItem>
              <MenuItem value="thousand">Thousand (M)</MenuItem>
              <MenuItem value="million">Million (MM)</MenuItem>
              <MenuItem value="billion">Billion (B)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Decimals"
            type="number"
            fullWidth
            size="small"
            value={config.decimals ?? 0}
            onChange={(e) => handleChange({ decimals: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 10 }}
            sx={{
              input: { color: 'white' },
              label: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Prefix"
            fullWidth
            size="small"
            value={config.prefix || ''}
            onChange={(e) => handleChange({ prefix: e.target.value })}
            placeholder="e.g., $"
            sx={{
              input: { color: 'white' },
              label: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Suffix"
            fullWidth
            size="small"
            value={config.suffix || ''}
            onChange={(e) => handleChange({ suffix: e.target.value })}
            placeholder="e.g., %, M, units"
            sx={{
              input: { color: 'white' },
              label: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Advanced Options Toggle */}
      <Box mt={2}>
        <MuiButton
          size="small"
          onClick={() => setShowAdvanced(!showAdvanced)}
          sx={{ color: 'white', textTransform: 'none' }}
        >
          {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Options
        </MuiButton>
      </Box>

      {/* Advanced Configuration */}
      {showAdvanced && (
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white' }}>Rounding</InputLabel>
              <Select
                value={config.rounding || 'round'}
                onChange={(e) => handleChange({ rounding: e.target.value as RoundingType })}
                label="Rounding"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '& .MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="round">Round (Standard)</MenuItem>
                <MenuItem value="floor">Floor (Round Down)</MenuItem>
                <MenuItem value="ceil">Ceil (Round Up)</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'white' }}>Show Sign</InputLabel>
              <Select
                value={config.showSign ? 'yes' : 'no'}
                onChange={(e) => handleChange({ showSign: e.target.value === 'yes' })}
                label="Show Sign"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '& .MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes (+/-)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      {/* Preview */}
      <Box mt={2} p={2} sx={{ backgroundColor: '#ffffff10', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 1 }}>
          Preview ({sampleValue.toLocaleString()}):
        </Typography>
        <Typography variant="h6" sx={{ color: '#84BD00', fontWeight: 'bold' }}>
          {preview}
        </Typography>
      </Box>

      {/* Clear Button */}
      <Box mt={2}>
        <Button
          label="Clear Formatting"
          size="small"
          outlined
          onClick={() => {
            setConfig({});
            onChange({});
          }}
        />
      </Box>
    </Paper>
  );
};
