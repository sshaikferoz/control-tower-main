'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ColorVariant, COLOR_VARIANTS } from './ColorVariantPicker';
import { HexColorPicker } from 'react-colorful';

interface ColorPaletteConfigUIProps {
    customVariants: ColorVariant[];
    onChange: (customVariants: ColorVariant[]) => void;
}

// Utility function for hex validation
const isValidHex = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

const ColorPaletteConfigUI: React.FC<ColorPaletteConfigUIProps> = ({
    customVariants = [],
    onChange,
}) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ColorVariant | null>(null);
    const [newVariant, setNewVariant] = useState<Partial<ColorVariant>>({
        name: '',
        colors: ['#000000', '#000000', '#000000', '#000000'],
        gradient: {
            start: '#000000',
            middle: '#000000',
            end: '#000000',
        },
    });
    const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
    const [editingGradientColor, setEditingGradientColor] = useState<'start' | 'middle' | 'end' | null>(null);
    const [hexInputs, setHexInputs] = useState<Record<number, string>>({});
    const [gradientHexInputs, setGradientHexInputs] = useState<Record<string, string>>({});

    const handleCreateNew = () => {
        const defaultColors = ['#84B000', '#00A3ED', '#0033A0', '#008430'];
        setNewVariant({
            name: '',
            colors: defaultColors,
            gradient: {
                start: '#0033A0',
                middle: '#00A3ED',
                end: '#84B000',
            },
        });
        // Initialize hex inputs
        const hexInputsInit: Record<number, string> = {};
        defaultColors.forEach((color, index) => {
            hexInputsInit[index] = color;
        });
        setHexInputs(hexInputsInit);

        // Initialize gradient hex inputs
        const gradientHexInit: Record<string, string> = {
            start: '#0033A0',
            middle: '#00A3ED',
            end: '#84B000',
        };
        setGradientHexInputs(gradientHexInit);

        setEditingVariant(null);
        setIsCreateDialogOpen(true);
    };

    const handleEdit = (variant: ColorVariant) => {
        setEditingVariant(variant);
        setNewVariant({
            name: variant.name,
            colors: [...variant.colors],
            gradient: { ...variant.gradient },
        });

        // Initialize hex inputs for colors
        const hexInputsInit: Record<number, string> = {};
        variant.colors.forEach((color, index) => {
            hexInputsInit[index] = color;
        });
        setHexInputs(hexInputsInit);

        // Initialize gradient hex inputs
        const gradientHexInit: Record<string, string> = {
            start: variant.gradient.start,
            middle: variant.gradient.middle,
            end: variant.gradient.end,
        };
        setGradientHexInputs(gradientHexInit);

        setIsCreateDialogOpen(true);
    };

    const handleDelete = (variantId: string) => {
        const updated = customVariants.filter((v) => v.id !== variantId);
        onChange(updated);
    };

    const handleSave = () => {
        if (!newVariant.name || !newVariant.colors || !newVariant.gradient) return;

        const variant: ColorVariant = {
            id: editingVariant?.id || `custom-${Date.now()}`,
            name: newVariant.name,
            colors: newVariant.colors,
            gradient: newVariant.gradient,
        };

        if (editingVariant) {
            // Update existing
            const updated = customVariants.map((v) => (v.id === editingVariant.id ? variant : v));
            onChange(updated);
        } else {
            // Add new
            onChange([...customVariants, variant]);
        }

        setIsCreateDialogOpen(false);
        setEditingVariant(null);
        setEditingColorIndex(null);
        setEditingGradientColor(null);
    };

    const handleCancel = () => {
        setIsCreateDialogOpen(false);
        setEditingVariant(null);
        setEditingColorIndex(null);
        setEditingGradientColor(null);
        setHexInputs({});
        setGradientHexInputs({});
    };

    const updateColor = (index: number, color: string) => {
        if (!newVariant.colors) return;
        const updatedColors = [...newVariant.colors];
        updatedColors[index] = color;
        setNewVariant({ ...newVariant, colors: updatedColors });
        setHexInputs({ ...hexInputs, [index]: color });
    };

    const handleHexInputChange = (index: number, hex: string) => {
        setHexInputs({ ...hexInputs, [index]: hex });
        if (isValidHex(hex)) {
            updateColor(index, hex);
        }
    };

    const updateGradientColor = (type: 'start' | 'middle' | 'end', color: string) => {
        if (!newVariant.gradient) return;
        setNewVariant({
            ...newVariant,
            gradient: { ...newVariant.gradient, [type]: color },
        });
        setGradientHexInputs({ ...gradientHexInputs, [type]: color });
    };

    const handleGradientHexInputChange = (type: 'start' | 'middle' | 'end', hex: string) => {
        setGradientHexInputs({ ...gradientHexInputs, [type]: hex });
        if (isValidHex(hex)) {
            updateGradientColor(type, hex);
        }
    };

    const addColor = () => {
        if (!newVariant.colors) return;
        const newColor = '#000000';
        const newIndex = newVariant.colors.length;
        setNewVariant({
            ...newVariant,
            colors: [...newVariant.colors, newColor],
        });
        setHexInputs({ ...hexInputs, [newIndex]: newColor });
    };

    const removeColor = (index: number) => {
        if (!newVariant.colors || newVariant.colors.length <= 1) return;
        const updatedColors = newVariant.colors.filter((_, i) => i !== index);
        setNewVariant({ ...newVariant, colors: updatedColors });
    };

    const allVariants = [...COLOR_VARIANTS, ...customVariants];

    return (
        <Box sx={{ color: 'white' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Color Palettes</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNew}
                    sx={{
                        backgroundColor: '#00A3ED',
                        '&:hover': { backgroundColor: '#0088C7' },
                    }}
                >
                    Create New Palette
                </Button>
            </Box>

            <Typography variant="body2" sx={{ mb: 3, color: '#aaa' }}>
                Manage color palettes available in the mapping screen. Default palettes are shown below, and you can create custom ones.
            </Typography>

            {/* Default Variants Section */}
            <Box mb={4}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Default Palettes ({COLOR_VARIANTS.length})
                </Typography>
                <Grid container spacing={2}>
                    {COLOR_VARIANTS.map((variant) => (
                        <Grid item xs={12} sm={6} md={4} key={variant.id}>
                            <Card
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    height: '100%',
                                    minHeight: '180px',
                                }}
                            >
                                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                                            {variant.name}
                                        </Typography>
                                        <Chip label="Default" size="small" sx={{ backgroundColor: '#84BD0020', color: '#84BD00' }} />
                                    </Box>

                                    {/* Gradient preview */}
                                    <Box
                                        sx={{
                                            height: 40,
                                            background: `linear-gradient(to bottom, ${variant.gradient.start} 0%, ${variant.gradient.middle} 45%, ${variant.gradient.end} 100%)`,
                                            borderRadius: '4px',
                                            marginBottom: 1.5,
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                        }}
                                    />

                                    {/* Color palette */}
                                    <Box display="flex" gap={1} alignItems="center" flex={1}>
                                        {variant.colors.map((color, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    flex: 1,
                                                    aspectRatio: '1',
                                                    backgroundColor: color,
                                                    borderRadius: '4px',
                                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Custom Variants Section */}
            {customVariants.length > 0 && (
                <Box>
                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Custom Palettes ({customVariants.length})
                    </Typography>
                    <Grid container spacing={2}>
                        {customVariants.map((variant) => (
                            <Grid item xs={12} sm={6} md={4} key={variant.id}>
                                <Card
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '2px solid rgba(0, 212, 255, 0.3)',
                                        borderRadius: '8px',
                                        height: '100%',
                                        minHeight: '180px',
                                        position: 'relative',
                                    }}
                                >
                                    <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                                            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                                                {variant.name}
                                            </Typography>
                                            <Box display="flex" gap={0.5}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(variant)}
                                                    sx={{ color: '#00d4ff' }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(variant.id)}
                                                    sx={{ color: '#E1553F' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {/* Gradient preview */}
                                        <Box
                                            sx={{
                                                height: 40,
                                                background: `linear-gradient(to bottom, ${variant.gradient.start} 0%, ${variant.gradient.middle} 45%, ${variant.gradient.end} 100%)`,
                                                borderRadius: '4px',
                                                marginBottom: 1.5,
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                            }}
                                        />

                                        {/* Color palette */}
                                        <Box display="flex" gap={1} alignItems="center" flex={1}>
                                            {variant.colors.map((color, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        flex: 1,
                                                        aspectRatio: '1',
                                                        backgroundColor: color,
                                                        borderRadius: '4px',
                                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={isCreateDialogOpen}
                onClose={handleCancel}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#1a3a6b',
                        color: 'white',
                    },
                }}
            >
                <DialogTitle>
                    {editingVariant ? 'Edit Color Palette' : 'Create New Color Palette'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Palette Name"
                            value={newVariant.name || ''}
                            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                },
                                '& label': { color: 'rgba(255, 255, 255, 0.7)' },
                            }}
                        />

                        {/* Colors */}
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
                            Colors
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {newVariant.colors?.map((color, index) => (
                                <Grid item xs={6} sm={4} md={3} key={index}>
                                    <Box>
                                        <Box
                                            onClick={() => setEditingColorIndex(editingColorIndex === index ? null : index)}
                                            sx={{
                                                width: '100%',
                                                aspectRatio: '1',
                                                backgroundColor: color,
                                                borderRadius: '4px',
                                                border: editingColorIndex === index ? '3px solid #00d4ff' : '2px solid rgba(255, 255, 255, 0.3)',
                                                cursor: 'pointer',
                                                mb: 1,
                                            }}
                                        />
                                        {editingColorIndex === index && (
                                            <Box sx={{ mt: 1 }}>
                                                <HexColorPicker
                                                    color={color}
                                                    onChange={(newColor) => updateColor(index, newColor)}
                                                />

                                                {/* Hex Input */}
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Hex"
                                                    value={hexInputs[index] || color}
                                                    onChange={(e) => handleHexInputChange(index, e.target.value)}
                                                    sx={{
                                                        mt: 2,
                                                        '& .MuiOutlinedInput-root': {
                                                            color: 'white',
                                                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                                        },
                                                        '& label': { color: 'rgba(255, 255, 255, 0.7)' },
                                                    }}
                                                    inputProps={{
                                                        style: { textTransform: 'uppercase' },
                                                        maxLength: 7,
                                                    }}
                                                />
                                            </Box>
                                        )}
                                        {newVariant.colors && newVariant.colors.length > 1 && (
                                            <IconButton
                                                size="small"
                                                onClick={() => removeColor(index)}
                                                sx={{ color: '#E1553F', mt: 0.5 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                            <Grid item xs={6} sm={4} md={3}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={addColor}
                                    sx={{
                                        height: '100%',
                                        minHeight: '60px',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        '&:hover': { borderColor: '#00d4ff' },
                                    }}
                                >
                                    Add Color
                                </Button>
                            </Grid>
                        </Grid>

                        {/* Gradient */}
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
                            Gradient
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    height: 60,
                                    background: `linear-gradient(to right, ${newVariant.gradient?.start || '#000'} 0%, ${newVariant.gradient?.middle || '#000'} 50%, ${newVariant.gradient?.end || '#000'} 100%)`,
                                    borderRadius: '4px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    mb: 2,
                                }}
                            />
                            <Grid container spacing={2}>
                                {(['start', 'middle', 'end'] as const).map((type) => (
                                    <Grid item xs={4} key={type}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Typography>
                                            <Box
                                                onClick={() => setEditingGradientColor(editingGradientColor === type ? null : type)}
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: '1',
                                                    backgroundColor: newVariant.gradient?.[type] || '#000',
                                                    borderRadius: '4px',
                                                    border: editingGradientColor === type ? '3px solid #00d4ff' : '2px solid rgba(255, 255, 255, 0.3)',
                                                    cursor: 'pointer',
                                                    mb: 1,
                                                }}
                                            />
                                            {editingGradientColor === type && (
                                                <Box sx={{ mt: 1 }}>
                                                    <HexColorPicker
                                                        color={newVariant.gradient?.[type] || '#000'}
                                                        onChange={(newColor) => updateGradientColor(type, newColor)}
                                                    />

                                                    {/* Hex Input */}
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Hex"
                                                        value={gradientHexInputs[type] || newVariant.gradient?.[type] || '#000'}
                                                        onChange={(e) => handleGradientHexInputChange(type, e.target.value)}
                                                        sx={{
                                                            mt: 2,
                                                            '& .MuiOutlinedInput-root': {
                                                                color: 'white',
                                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                                            },
                                                            '& label': { color: 'rgba(255, 255, 255, 0.7)' },
                                                        }}
                                                        inputProps={{
                                                            style: { textTransform: 'uppercase' },
                                                            maxLength: 7,
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Button onClick={handleCancel} sx={{ color: 'white' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!newVariant.name || !newVariant.colors || newVariant.colors.length === 0}
                        sx={{
                            backgroundColor: '#00A3ED',
                            '&:hover': { backgroundColor: '#0088C7' },
                        }}
                    >
                        {editingVariant ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ColorPaletteConfigUI;
