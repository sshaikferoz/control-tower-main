// components/TypographyConfigUI.tsx
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { TypographyConfig, WidgetTypographyConfig } from '@/types/helpers';

const FONT_FAMILIES = [
  'Poppins, sans-serif',
  'Inter, sans-serif',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Montserrat, sans-serif',
  'Lato, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
];

const FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

interface TypographyConfigUIProps {
  value?: WidgetTypographyConfig;
  onChange: (config: WidgetTypographyConfig) => void;
  elementTypes?: string[];
}

export const TypographyConfigUI: React.FC<TypographyConfigUIProps> = ({
  value = {},
  onChange,
  elementTypes = ['title', 'value', 'label'],
}) => {
  const handleChange = (
    elementType: string,
    property: keyof TypographyConfig,
    propertyValue: any
  ) => {
    const newConfig = {
      ...value,
      [elementType]: {
        ...(value[elementType] || {}),
        [property]: propertyValue,
      },
    };
    onChange(newConfig);
  };

  const handleReset = (elementType: string) => {
    const newConfig = { ...value };
    delete newConfig[elementType];
    onChange(newConfig);
  };

  const getPreview = (type: string) =>
    ({
      title: 'Widget Title',
      value: '1,234,567',
      label: 'Label Text',
    })[type] || 'Preview Text';

  return (
    <Box sx={{ color: 'white' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Typography Settings
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: '#aaa' }}>
        Fine-tune typography for each element. Changes instantly affect your widget.
      </Typography>

      {elementTypes.map((type) => {
        const config = value[type] || {};
        const isConfigured = Object.keys(config).length > 0;

        return (
          <Accordion
            key={type}
            disableGutters
            sx={{
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              mb: 1.5,
              borderRadius: 2,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{
                px: 2,
                borderRadius: 2,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Typography sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                  {type} Typography
                </Typography>
                {isConfigured && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#84BD00',
                      backgroundColor: '#84BD0020',
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                    }}
                  >
                    Configured
                  </Typography>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2, pb: 2 }}>
              {/* Preview */}
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  textAlign: config.textAlign || 'left',
                  fontFamily: config.fontFamily || 'inherit',
                  fontSize: config.fontSize || '16px',
                  fontWeight: config.fontWeight || 400,
                  textTransform: config.textTransform || 'none',
                  letterSpacing: config.letterSpacing,
                  lineHeight: config.lineHeight,
                  color: config.color || 'white',
                  transition: 'all 0.3s ease',
                }}
              >
                {getPreview(type)}
              </Box>

              <Grid container spacing={2}>
                {/* Font Family */}
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'white' }}>Font Family</InputLabel>
                    <Select
                      value={config.fontFamily || ''}
                      label="Font Family"
                      onChange={(e) => handleChange(type, 'fontFamily', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      }}
                    >
                      <MenuItem value="">Default</MenuItem>
                      {FONT_FAMILIES.map((f) => (
                        <MenuItem key={f} value={f} style={{ fontFamily: f }}>
                          {f.split(',')[0]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Size + Weight */}
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'white' }}>Font Size</InputLabel>
                    <Select
                      value={config.fontSize || ''}
                      label="Font Size"
                      onChange={(e) => handleChange(type, 'fontSize', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      }}
                    >
                      <MenuItem value="">Default</MenuItem>
                      {FONT_SIZES.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'white' }}>Font Weight</InputLabel>
                    <Select
                      value={config.fontWeight || ''}
                      label="Font Weight"
                      onChange={(e) => handleChange(type, 'fontWeight', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      }}
                    >
                      <MenuItem value="">Default</MenuItem>
                      {FONT_WEIGHTS.map((w) => (
                        <MenuItem key={w} value={w}>
                          {w}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Color Picker */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Color (Hex)"
                    type="color"
                    value={config.color || '#ffffff'}
                    onChange={(e) => handleChange(type, 'color', e.target.value)}
                    sx={{
                      '& input': { height: '40px', cursor: 'pointer' },
                      label: { color: 'white' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'white' },
                        '&:hover fieldset': { borderColor: 'white' },
                      },
                    }}
                  />
                </Grid>

                {/* Alignment buttons */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                      Text Align
                    </Typography>
                    <Box>
                      <Tooltip title="Left">
                        <IconButton
                          size="small"
                          onClick={() => handleChange(type, 'textAlign', 'left')}
                          sx={{
                            color: config.textAlign === 'left' ? '#84BD00' : 'white',
                          }}
                        >
                          <FormatAlignLeftIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Center">
                        <IconButton
                          size="small"
                          onClick={() => handleChange(type, 'textAlign', 'center')}
                          sx={{
                            color: config.textAlign === 'center' ? '#84BD00' : 'white',
                          }}
                        >
                          <FormatAlignCenterIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Right">
                        <IconButton
                          size="small"
                          onClick={() => handleChange(type, 'textAlign', 'right')}
                          sx={{
                            color: config.textAlign === 'right' ? '#84BD00' : 'white',
                          }}
                        >
                          <FormatAlignRightIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>

                {/* Letter spacing + line height */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Letter Spacing"
                    value={config.letterSpacing || ''}
                    onChange={(e) => handleChange(type, 'letterSpacing', e.target.value)}
                    placeholder="e.g., 1px"
                    sx={{
                      input: { color: 'white' },
                      label: { color: 'white' },
                      '& .MuiOutlinedInput-root fieldset': { borderColor: 'white' },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Line Height"
                    value={config.lineHeight || ''}
                    onChange={(e) => handleChange(type, 'lineHeight', e.target.value)}
                    placeholder="e.g., 1.5"
                    sx={{
                      input: { color: 'white' },
                      label: { color: 'white' },
                      '& .MuiOutlinedInput-root fieldset': { borderColor: 'white' },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Reset */}
              {isConfigured && (
                <>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Box display="flex" justifyContent="flex-end">
                    <Tooltip title="Reset to default">
                      <IconButton
                        onClick={() => handleReset(type)}
                        sx={{
                          color: '#E1553F',
                          transition: '0.3s',
                          '&:hover': { backgroundColor: '#E1553F20' },
                        }}
                      >
                        <RestartAltIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};
