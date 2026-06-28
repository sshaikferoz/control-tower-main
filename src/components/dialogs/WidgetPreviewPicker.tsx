import React, { useCallback, useMemo, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@/contexts/ThemeContext';
import { widgetMapping, defaultPropsMapping } from '@/constants/widgetConfig';
import { LazyWidgetContent } from '@/widgets/LazyWidgetContent';
import { DataManager } from '@/services/DataManager';
import {
    processWidgetMappings,
    fetchAndTransformMultiChartData,
} from '@/helpers/transformHelpers';

interface WidgetPreviewPickerProps {
    open: boolean;
    onClose: () => void;
    /** Raw dashboard sections (each with widgets + fieldMappings + layout). */
    sections: any[];
    /** 'Report' renders one flat grid with no section names. */
    dashboardType?: 'Sections' | 'Report';
    /** Whether a widget is currently removed (hidden) from the user's dashboard. */
    getHidden: (sectionId: string, widgetId: string) => boolean;
    /** Add (hidden=false) or remove (hidden=true) a widget. */
    onToggle: (sectionId: string, widgetId: string, hidden: boolean) => void;
}

const cleanWidgetProps = (widget: any) => {
    if (widget?.props && Object.keys(widget.props).length > 0) {
        const { configType, widgetCategory, ...clean } = widget.props;
        return clean;
    }
    return defaultPropsMapping[widget.name] || {};
};

// Real, user-meaningful title only — deliberately does NOT fall back to the
// widget type (e.g. "kpi-chart"), which isn't useful to end users.
const getWidgetTitle = (widget: any): string | undefined =>
    widget?.props?.title || widget?.title || widget?.description || undefined;

/**
 * Renders a single widget exactly as it appears on the dashboard, loading its
 * data through the same pipeline (DataManager + mapping transforms) so the
 * preview is faithful. No controls — wrapped by PickerTile / group tiles.
 */
const LiveWidget: React.FC<{ widget: any; fieldMappings: Record<string, any> }> = ({
    widget,
    fieldMappings,
}) => {
    const Component = widgetMapping[widget.name];
    const [props, setProps] = useState<Record<string, any>>(() => cleanWidgetProps(widget));
    const [isLoading, setIsLoading] = useState(false);

    const load = useCallback(async () => {
        const mappingConfig = fieldMappings?.[widget.id];
        if (!mappingConfig?.reportName) return;
        const reportName = mappingConfig.reportName;

        if (widget.name === 'multi-chart' && mappingConfig.chartConfig) {
            if (!mappingConfig.chartConfig.xAxis?.field || !mappingConfig.chartConfig.yAxis?.fields) {
                return;
            }
            try {
                setIsLoading(true);
                const existing =
                    widget.props && Object.keys(widget.props).length > 0
                        ? widget.props
                        : defaultPropsMapping[widget.name] || {};
                const transformed = await fetchAndTransformMultiChartData(
                    reportName,
                    mappingConfig.chartConfig,
                    existing
                );
                setProps(transformed);
            } catch (error) {
                console.error(`Preview load failed for multi-chart ${widget.id}:`, error);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Other widgets already carrying saved props don't need a fetch.
        if (widget.props && Object.keys(widget.props).length > 0) return;

        try {
            setIsLoading(true);
            const data = await DataManager.getInstance().getData(reportName);
            setProps(processWidgetMappings(widget, mappingConfig, data));
        } catch (error) {
            console.error(`Preview load failed for ${widget.id}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [widget, fieldMappings]);

    if (!Component) {
        return (
            <div
                className="flex h-full w-full items-center justify-center text-xs"
                style={{ color: 'var(--text-muted)' }}
            >
                {widget.name}
            </div>
        );
    }

    return (
        <LazyWidgetContent
            widget={widget}
            Component={Component}
            props={props}
            onVisible={load}
            isLoading={isLoading}
        />
    );
};

/**
 * Card shell with the info + add/remove controls. Added vs not-added is shown
 * with a subtle dim and a check/plus icon — no loud colour highlight.
 */
const PickerTile: React.FC<{
    title?: string;
    /** Rich caption (e.g. group title with a hoverable "+N more"). Overrides title. */
    titleNode?: React.ReactNode;
    description: string;
    included: boolean;
    onToggle: () => void;
    onPreview: () => void;
    children: React.ReactNode;
}> = ({ title, titleNode, description, included, onToggle, onPreview, children }) => (
    <div
        className="relative flex flex-col overflow-hidden rounded-xl transition-all"
        style={{
            border: '1px solid var(--widget-border)',
            background: 'var(--widget-bg)',
            boxShadow: 'var(--widget-shadow)',
            opacity: included ? 1 : 0.55,
        }}
    >
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            <Tooltip title={description} arrow placement="top">
                <IconButton
                    size="small"
                    sx={{
                        width: 28,
                        height: 28,
                        background: 'rgba(0, 0, 0, 0.45)',
                        color: 'white',
                        '&:hover': { background: 'rgba(0, 0, 0, 0.65)' },
                    }}
                >
                    <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Preview widget" arrow placement="top">
                <IconButton
                    size="small"
                    onClick={onPreview}
                    sx={{
                        width: 28,
                        height: 28,
                        background: 'rgba(0, 0, 0, 0.45)',
                        color: 'white',
                        '&:hover': { background: 'rgba(0, 0, 0, 0.65)' },
                    }}
                >
                    <OpenInFullIcon sx={{ fontSize: 14 }} />
                </IconButton>
            </Tooltip>
            <Tooltip title={included ? 'Remove from dashboard' : 'Add to dashboard'} arrow placement="top">
                <IconButton
                    size="small"
                    onClick={onToggle}
                    sx={{
                        width: 28,
                        height: 28,
                        background: 'rgba(0, 0, 0, 0.55)',
                        color: 'white',
                        '&:hover': { background: 'rgba(0, 0, 0, 0.75)' },
                    }}
                >
                    {included ? (
                        <CheckIcon sx={{ fontSize: 18 }} />
                    ) : (
                        <AddIcon sx={{ fontSize: 18 }} />
                    )}
                </IconButton>
            </Tooltip>
        </div>

        <div className="relative h-44 w-full overflow-hidden">
            <div
                className="pointer-events-none absolute"
                style={{
                    width: '200%',
                    height: '200%',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left',
                }}
            >
                {children}
            </div>
        </div>

        {titleNode ? (
            <div
                className="flex justify-center"
                style={{ padding: '6px 12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}
            >
                {titleNode}
            </div>
        ) : title ? (
            <Typography
                variant="caption"
                noWrap
                sx={{ px: 1.5, py: 0.75, color: 'var(--text-muted)', textAlign: 'center' }}
                title={title}
            >
                {title}
            </Typography>
        ) : (
            // No real title — keep a small spacer instead of showing the widget type.
            <div style={{ height: 8 }} />
        )}
    </div>
);

// --- Grouping helpers (mirror DashboardSection so a group previews as one) ---
const getWidgetGroupId = (widget: any): string | undefined => widget?.props?.groupId;

const getMemberRect = (widget: any, layout: any[]) => {
    const gl = widget?.props?.groupLayout;
    if (gl && typeof gl.x === 'number') {
        return { x: gl.x, y: gl.y, w: gl.w, h: gl.h };
    }
    const item = (layout || []).find((l: any) => l.i === widget.id);
    return { x: item?.x ?? 0, y: item?.y ?? 0, w: item?.w ?? 4, h: item?.h ?? 3 };
};

const computeGroupBBox = (members: any[], layout: any[]) => {
    const rects = members.map((m) => getMemberRect(m, layout));
    const minX = Math.min(...rects.map((r) => r.x));
    const minY = Math.min(...rects.map((r) => r.y));
    const maxX = Math.max(...rects.map((r) => r.x + r.w));
    const maxY = Math.max(...rects.map((r) => r.y + r.h));
    return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
};

type PickerItem =
    | { kind: 'single'; key: string; widget: any }
    | { kind: 'group'; key: string; groupId: string; members: any[]; bbox: any; layout: any[] };

type PreviewTarget = {
    title?: string;
    titleNode?: React.ReactNode;
    included: boolean;
    onToggle: () => void;
    content: React.ReactNode;
};

export const WidgetPreviewPicker: React.FC<WidgetPreviewPickerProps> = ({
    open,
    onClose,
    sections,
    dashboardType = 'Sections',
    getHidden,
    onToggle,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const paperBackground = isDark ? 'rgba(10, 26, 53, 0.97)' : 'var(--widget-surface)';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'var(--widget-border)';

    const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);

    const isReport = dashboardType === 'Report';

    // Build per-section render items, collapsing grouped widgets into one item.
    const grouped = useMemo(() => {
        return (sections || []).map((section) => {
            const sectionId = section.id || section.originalSection?.id || '';
            const sectionName = section.sectionName || section.originalSection?.name || '';
            const layout = section.layout || [];
            const widgets = (section.widgets || []).filter(
                (w: any) => w.name !== 'announcement' && w.active !== false
            );

            const groupMap = new Map<string, any[]>();
            const singles: any[] = [];
            widgets.forEach((w: any) => {
                const gid = getWidgetGroupId(w);
                if (gid) {
                    groupMap.set(gid, [...(groupMap.get(gid) || []), w]);
                } else {
                    singles.push(w);
                }
            });

            const items: PickerItem[] = [
                ...singles.map((w: any) => ({ kind: 'single' as const, key: w.id, widget: w })),
                ...Array.from(groupMap.entries()).map(([groupId, members]) => ({
                    kind: 'group' as const,
                    key: groupId,
                    groupId,
                    members,
                    bbox: computeGroupBBox(members, layout),
                    layout,
                })),
            ];

            return { sectionId, sectionName, fieldMappings: section.fieldMappings || {}, items };
        });
    }, [sections]);

    const renderItem = (
        sectionId: string,
        fieldMappings: Record<string, any>,
        item: PickerItem
    ) => {
        if (item.kind === 'single') {
            const widget = item.widget;
            const included = !getHidden(sectionId, widget.id);
            const description =
                widget?.description ||
                widget?.props?.targetReport?.description ||
                fieldMappings?.[widget.id]?.targetReport?.description ||
                'No description available';
            const liveWidget = <LiveWidget widget={widget} fieldMappings={fieldMappings} />;
            return (
                <PickerTile
                    key={`${sectionId}-${item.key}`}
                    title={getWidgetTitle(widget)}
                    description={description}
                    included={included}
                    onToggle={() => onToggle(sectionId, widget.id, included)}
                    onPreview={() =>
                        setPreviewTarget({
                            title: getWidgetTitle(widget),
                            included,
                            onToggle: () => onToggle(sectionId, widget.id, included),
                            content: liveWidget,
                        })
                    }
                >
                    {liveWidget}
                </PickerTile>
            );
        }

        // Grouped widgets render as one tile; members positioned within the bbox.
        const { members, bbox, layout } = item;
        const included = members.every((m) => !getHidden(sectionId, m.id));
        const namedMember = members.find((m) => getWidgetTitle(m));
        const groupBase = namedMember ? getWidgetTitle(namedMember) : undefined;
        const description = `Grouped widget — ${members.length} widgets that move together.`;

        // Titles of the other members, surfaced on hover over "+N more".
        const otherMembers = members.filter((m) => m !== namedMember);
        const otherCount = otherMembers.length;
        const moreTooltip = (
            <div>
                {otherMembers.map((m, i) => (
                    <div key={m.id ?? i}>{getWidgetTitle(m) || m.name}</div>
                ))}
            </div>
        );
        const titleNode = groupBase ? (
            <span className="flex items-center gap-1 truncate">
                <span className="truncate">{groupBase}</span>
                {otherCount > 0 && (
                    <Tooltip title={moreTooltip} arrow placement="top">
                        <span
                            className="cursor-help whitespace-nowrap underline decoration-dotted underline-offset-2"
                            style={{ color: 'var(--foreground)' }}
                        >
                            +{otherCount} more
                        </span>
                    </Tooltip>
                )}
            </span>
        ) : undefined;

        const groupContent = (
            <div className="relative h-full w-full">
                {members.map((member: any) => {
                    const rect = getMemberRect(member, layout);
                    return (
                        <div
                            key={member.id}
                            className="absolute"
                            style={{
                                left: `${((rect.x - bbox.x) / bbox.w) * 100}%`,
                                top: `${((rect.y - bbox.y) / bbox.h) * 100}%`,
                                width: `${(rect.w / bbox.w) * 100}%`,
                                height: `${(rect.h / bbox.h) * 100}%`,
                            }}
                        >
                            <LiveWidget widget={member} fieldMappings={fieldMappings} />
                        </div>
                    );
                })}
            </div>
        );
        const toggleGroup = () => members.forEach((m) => onToggle(sectionId, m.id, included));
        return (
            <PickerTile
                key={`${sectionId}-${item.key}`}
                titleNode={titleNode}
                description={description}
                included={included}
                onToggle={toggleGroup}
                onPreview={() =>
                    setPreviewTarget({
                        titleNode,
                        included,
                        onToggle: toggleGroup,
                        content: groupContent,
                    })
                }
            >
                {groupContent}
            </PickerTile>
        );
    };

    const gridClass = 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    const noWidgets = grouped.every((g) => g.items.length === 0);

    return (
        <>
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    background: paperBackground,
                    color: 'var(--foreground)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: 'var(--widget-shadow)',
                },
            }}
        >
            <DialogTitle
                sx={{ color: 'var(--foreground)', borderBottom: `1px solid ${borderColor}` }}
            >
                Add or remove widgets
                <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-muted)' }}>
                    Use the + / ✓ on each widget to add it to or remove it from your dashboard.
                </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor, background: paperBackground }}>
                {noWidgets ? (
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        No widgets available for this tab.
                    </Typography>
                ) : isReport ? (
                    // Single-report feel: all widgets together, no section names.
                    <div className={gridClass}>
                        {grouped.flatMap((g) =>
                            g.items.map((item) => renderItem(g.sectionId, g.fieldMappings, item))
                        )}
                    </div>
                ) : (
                    grouped
                        .filter((g) => g.items.length > 0)
                        .map((g) => (
                            <div key={g.sectionId} className="mb-6">
                                <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1.5, fontWeight: 700, color: 'var(--section-title)' }}
                                >
                                    {g.sectionName}
                                </Typography>
                                <div className={gridClass}>
                                    {g.items.map((item) =>
                                        renderItem(g.sectionId, g.fieldMappings, item)
                                    )}
                                </div>
                            </div>
                        ))
                )}
            </DialogContent>
            <DialogActions sx={{ borderTop: `1px solid ${borderColor}` }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        backgroundColor: 'var(--secondary1)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'var(--secondary1)', opacity: 0.9 },
                    }}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog
            open={!!previewTarget}
            onClose={() => setPreviewTarget(null)}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    background: paperBackground,
                    color: 'var(--foreground)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: 'var(--widget-shadow)',
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <DialogTitle
                sx={{
                    color: 'var(--foreground)',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                }}
            >
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {previewTarget?.titleNode ?? previewTarget?.title ?? 'Widget Preview'}
                </span>
                <div className="flex items-center gap-1">
                    <Tooltip title={previewTarget?.included ? 'Remove from dashboard' : 'Add to dashboard'} arrow>
                        <IconButton
                            size="small"
                            onClick={() => {
                                previewTarget?.onToggle();
                                setPreviewTarget(null);
                            }}
                            sx={{
                                background: 'rgba(0,0,0,0.45)',
                                color: 'white',
                                '&:hover': { background: 'rgba(0,0,0,0.65)' },
                            }}
                        >
                            {previewTarget?.included ? <CheckIcon sx={{ fontSize: 18 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        size="small"
                        onClick={() => setPreviewTarget(null)}
                        sx={{ color: 'var(--text-muted)', ml: 0.5 }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent sx={{ flex: 1, overflow: 'auto', p: 2, background: paperBackground }}>
                <div className="h-full w-full">{previewTarget?.content}</div>
            </DialogContent>
        </Dialog>

    </>
    );
};
