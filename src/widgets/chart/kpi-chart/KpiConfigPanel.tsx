'use client';

import React, { useMemo } from 'react';
import {
    Typography,
    TextField,
    Divider,
    Button,
    Card,
    CardContent,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { KpiWidgetConfig, KpiType, ColorRange } from './KpiConfig.types';

interface KpiConfigPanelProps {
    response?: any;
    value: KpiWidgetConfig;
    onChange: (config: KpiWidgetConfig) => void;
}

const defaultConfig: KpiWidgetConfig = {
    minValue: 0,
    maxValue: 100,
    colorRanges: [
        { min: 0, max: 25, color: '#4CAF50', label: 'Low' },
        { min: 25, max: 75, color: '#FFC107', label: 'Moderate' },
        { min: 75, max: 100, color: '#F44336', label: 'High' },
    ],
    showLabels: true,
    showTitle: true,
    valueFormat: 'non-currency',
    decimalPrecision: 2,
    kpiType: 'number',
    targetSource: 'manual',
    showTargetValueTop: false,
};

export const KpiConfigPanel: React.FC<KpiConfigPanelProps> = ({
    response,
    value = defaultConfig,
    onChange,
}) => {
    const config = { ...defaultConfig, ...value };

    const availableFields = useMemo(() => {
        if (!response) {
            return {
                charKeys: [],
                keyFigureKeys: [],
                headerText: {},
                charUniqueValues: {},
            };
        }

        const charKeys = response.charKeys || [];
        const keyFigureKeys = response.keyFigureKeys || [];
        const headerText = response.headerText || {};
        const charUniqueValues = response.charUniqueValues || {};

        return {
            charKeys,
            keyFigureKeys,
            headerText,
            charUniqueValues,
        };
    }, [response]);

    const handleChange = (key: keyof KpiWidgetConfig, newValue: any) => {
        onChange({
            ...config,
            [key]: newValue,
        });
    };

    const handleColorRangeChange = (index: number, field: keyof ColorRange, newValue: any) => {
        const newRanges = [...(config.colorRanges || [])];
        newRanges[index] = {
            ...newRanges[index],
            [field]: newValue,
        };
        handleChange('colorRanges', newRanges);
    };

    const handleAddColorRange = () => {
        const newRanges = [...(config.colorRanges || [])];
        const lastRange = newRanges[newRanges.length - 1];
        const newMin = lastRange ? lastRange.max : config.minValue;
        const newMax = Math.min(newMin + 25, config.maxValue);

        newRanges.push({
            min: newMin,
            max: newMax,
            color: '#888888',
            label: `Range ${newRanges.length + 1}`,
        });
        handleChange('colorRanges', newRanges);
    };

    const handleRemoveColorRange = (index: number) => {
        const newRanges = [...(config.colorRanges || [])];
        newRanges.splice(index, 1);
        handleChange('colorRanges', newRanges);
    };

    return (
        <div className="text-white">
            {/* Scale Range */}
            <div className="mb-4">
                <Typography variant="subtitle2" className="mb-4 font-semibold text-sm">
                    Scale Range
                </Typography>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <TextField
                            label="Min Value"
                            type="number"
                            value={config.minValue}
                            onChange={(e) => handleChange('minValue', parseFloat(e.target.value) || 0)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#00d4ff',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                },
                            }}
                        />
                    </div>
                    <div className="col-span-6">
                        <TextField
                            label="Max Value"
                            type="number"
                            value={config.maxValue}
                            onChange={(e) => handleChange('maxValue', parseFloat(e.target.value) || 100)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#00d4ff',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            <Divider className="my-4 border-white/20" />

            {/* Color Ranges */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <Typography variant="subtitle2" className="font-semibold text-sm">
                        Color Ranges
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddColorRange}
                        size="small"
                        sx={{
                            color: '#00d4ff',
                            borderColor: '#00d4ff',
                            '&:hover': {
                                borderColor: '#00d4ff',
                                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            },
                        }}
                        variant="outlined"
                    >
                        Add Range
                    </Button>
                </div>
                <Typography variant="caption" className="mb-4 text-white/70 text-xs block">
                    Configure color ranges for the KPI gauge scale. Each range will control the color of the KPI bar and donut.
                </Typography>

                <div className="flex flex-col gap-3">
                    {(config.colorRanges || []).map((range, index) => (
                        <Card
                            key={index}
                            variant="outlined"
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiCardContent-root': {
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            <CardContent sx={{ py: 1.5, px: 1.5, '&:last-child': { pb: 1.5 } }}>
                                {/* Header: Color Indicator, Label, Delete Button */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div
                                        className="w-5 h-5 rounded border border-white/20 flex-shrink-0"
                                        style={{ backgroundColor: range.color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <Typography
                                            variant="body2"
                                            className="text-white font-medium text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                                        >
                                            {range.label || `Range ${index + 1}`}
                                        </Typography>
                                    </div>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveColorRange(index)}
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            padding: '4px',
                                            '&:hover': {
                                                color: '#ff4444',
                                                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                            },
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: '1rem' }} />
                                    </IconButton>
                                </div>

                                {/* Min and Max in a row */}
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1">
                                        <Typography variant="caption" className="text-white/70 text-xs mb-1 block">
                                            Min
                                        </Typography>
                                        <TextField
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={range.min}
                                            onChange={(e) =>
                                                handleColorRangeChange(index, 'min', parseFloat(e.target.value) || 0)
                                            }
                                            inputProps={{
                                                style: { color: 'white', fontSize: '0.75rem', padding: '6px 8px' },
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00d4ff',
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Typography variant="caption" className="text-white/70 text-xs mb-1 block">
                                            Max
                                        </Typography>
                                        <TextField
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={range.max}
                                            onChange={(e) =>
                                                handleColorRangeChange(index, 'max', parseFloat(e.target.value) || 0)
                                            }
                                            inputProps={{
                                                style: { color: 'white', fontSize: '0.75rem', padding: '6px 8px' },
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#00d4ff',
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="mb-2">
                                    <Typography variant="caption" className="text-white/70 text-xs mb-1 block">
                                        Label
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={range.label || ''}
                                        onChange={(e) => handleColorRangeChange(index, 'label', e.target.value)}
                                        placeholder="Range label"
                                        inputProps={{
                                            style: { color: 'white', fontSize: '0.75rem', padding: '6px 8px' },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#00d4ff',
                                                },
                                            },
                                        }}
                                    />
                                </div>

                                {/* Color Picker */}
                                <div>
                                    <Typography variant="caption" className="text-white/70 text-xs mb-1 block">
                                        Color
                                    </Typography>
                                    <label
                                        className="w-full h-9 rounded border border-white/20 cursor-pointer block hover:border-[#00d4ff] transition-colors"
                                        style={{
                                            backgroundColor: range.color,
                                            boxShadow: `0 0 8px ${range.color}80`,
                                        }}
                                    >
                                        <input
                                            type="color"
                                            value={range.color}
                                            onChange={(e) => handleColorRangeChange(index, 'color', e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                opacity: 0,
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Divider className="my-4 border-white/20" />

            {/* Data Selection */}
            <div className="mb-4">
                <Typography variant="subtitle2" className="mb-3 font-semibold text-sm">
                    Data Selection
                </Typography>
                <Typography variant="caption" className="mb-4 text-white/70 text-xs block">
                    Select which field to use for the KPI value. The KPI displays a single value from the query result.
                </Typography>

                <FormControl fullWidth className="mb-4">
                    <InputLabel
                        id="kpi-value-key-label"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                            },
                        }}
                    >
                        Value Field
                    </InputLabel>
                    <Select
                        labelId="kpi-value-key-label"
                        value={config.valueKey || ''}
                        onChange={(e) => handleChange('valueKey', e.target.value || undefined)}
                        label="Value Field"
                        sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#00d4ff',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'white',
                            },
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {availableFields.keyFigureKeys.map((key: string) => (
                            <MenuItem key={key} value={key}>
                                {availableFields.headerText[key] || key}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="caption" className="mb-2 text-white/70 text-xs block">
                    Optional target value shown as an indicator on KPI scales.
                </Typography>

                <FormControl fullWidth className="mb-4">
                    <InputLabel
                        id="kpi-target-source-label"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                            },
                        }}
                    >
                        Target Source
                    </InputLabel>
                    <Select
                        labelId="kpi-target-source-label"
                        value={config.targetSource || 'manual'}
                        onChange={(e) => handleChange('targetSource', e.target.value)}
                        label="Target Source"
                        sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#00d4ff',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'white',
                            },
                        }}
                    >
                        <MenuItem value="manual">Manual</MenuItem>
                        <MenuItem value="query">From Query Field</MenuItem>
                    </Select>
                </FormControl>

                {(config.targetSource || 'manual') === 'manual' ? (
                    <TextField
                        label="Target Value"
                        type="number"
                        value={config.targetManualValue ?? ''}
                        onChange={(e) =>
                            handleChange(
                                'targetManualValue',
                                e.target.value === '' ? undefined : parseFloat(e.target.value)
                            )
                        }
                        fullWidth
                        className="mb-4"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#00d4ff',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                            },
                        }}
                    />
                ) : (
                    <FormControl fullWidth className="mb-4">
                        <InputLabel
                            id="kpi-target-value-key-label"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-focused': {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                },
                            }}
                        >
                            Target Field
                        </InputLabel>
                        <Select
                            labelId="kpi-target-value-key-label"
                            value={config.targetValueKey || ''}
                            onChange={(e) => handleChange('targetValueKey', e.target.value || undefined)}
                            label="Target Field"
                            sx={{
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#00d4ff',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                },
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {availableFields.keyFigureKeys.map((key: string) => (
                                <MenuItem key={key} value={key}>
                                    {availableFields.headerText[key] || key}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <FormControlLabel
                    className="mb-2"
                    control={
                        <Checkbox
                            checked={config.showTargetValueTop === true}
                            onChange={(e) => handleChange('showTargetValueTop', e.target.checked)}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-checked': {
                                    color: '#00d4ff',
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            Show Target Value At Top
                        </Typography>
                    }
                />

                <TextField
                    label="Listen To Event (Optional)"
                    value={config.listenToEvent || ''}
                    onChange={(e) => handleChange('listenToEvent', e.target.value || undefined)}
                    placeholder="filter-changed"
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#00d4ff',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: 'rgba(255, 255, 255, 0.9)',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            opacity: 1,
                        },
                    }}
                />
            </div>

            <Divider className="my-4 border-white/20" />

            {/* KPI Type */}
            <div className="mb-4">
                <Typography variant="subtitle2" className="mb-3 font-semibold text-sm">
                    KPI Type
                </Typography>
                <Typography variant="caption" className="mb-2 text-white/70 text-xs block">
                    Choose how this KPI should be visualized.
                </Typography>
                <FormControl fullWidth>
                    <InputLabel
                        id="kpi-type-label"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                            },
                        }}
                    >
                        KPI Type
                    </InputLabel>
                    <Select
                        labelId="kpi-type-label"
                        value={(config.kpiType || 'number') as KpiType}
                        onChange={(e) => handleChange('kpiType', e.target.value as KpiType)}
                        label="KPI Type"
                        sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#00d4ff',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'white',
                            },
                        }}
                    >
                        <MenuItem value="number">Number</MenuItem>
                        <MenuItem value="numberWithDelta">Number with Delta</MenuItem>
                        <MenuItem value="progress">Progress</MenuItem>
                        <MenuItem value="radialBar">Radial Bar</MenuItem>
                        <MenuItem value="status">Status</MenuItem>
                        <MenuItem value="bullet">Bullet</MenuItem>
                        <MenuItem value="gauge">Gauge</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {/* Display Options */}
            <div className="mb-4">
                <Typography variant="subtitle2" className="mb-3 font-semibold text-sm">
                    Display Options
                </Typography>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config.showLabels !== false}
                            onChange={(e) => handleChange('showLabels', e.target.checked)}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-checked': {
                                    color: '#00d4ff',
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            Show Labels
                        </Typography>
                    }
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config.showTitle !== false}
                            onChange={(e) => handleChange('showTitle', e.target.checked)}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-checked': {
                                    color: '#00d4ff',
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            Show Title
                        </Typography>
                    }
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config.transparentBackground === true}
                            onChange={(e) => handleChange('transparentBackground', e.target.checked)}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-checked': {
                                    color: '#00d4ff',
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            Transparent Background
                        </Typography>
                    }
                />
            </div>

            {/* Value Format */}
            <FormControl fullWidth className="mb-4">
                <InputLabel
                    id="kpi-value-format-label"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                            color: 'rgba(255, 255, 255, 0.9)',
                        },
                    }}
                >
                    Value Format
                </InputLabel>
                <Select
                    labelId="kpi-value-format-label"
                    value={config.valueFormat || 'non-currency'}
                    onChange={(e) => handleChange('valueFormat', e.target.value)}
                    label="Value Format"
                    sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00d4ff',
                        },
                        '& .MuiSvgIcon-root': {
                            color: 'white',
                        },
                    }}
                >
                    <MenuItem value="non-currency">Non-Currency</MenuItem>
                    <MenuItem value="currency">Currency</MenuItem>
                </Select>
            </FormControl>

            <TextField
                label="Decimal Precision"
                type="number"
                value={config.decimalPrecision ?? 2}
                onChange={(e) => {
                    const num = Number(e.target.value);
                    handleChange('decimalPrecision', Number.isFinite(num) ? Math.max(0, num) : undefined);
                }}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
                sx={{
                    '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#00d4ff',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: 'rgba(255, 255, 255, 0.9)',
                    },
                }}
            />
        </div>
    );
};

