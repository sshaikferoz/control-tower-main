// App.jsx - Complete Dashboard Builder POC with SAP BW Variables
import React, { useState, useEffect, useCallback } from 'react';
import { createServer } from 'miragejs';
import { create } from 'zustand';
import RGL, { WidthProvider } from 'react-grid-layout/legacy';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl, InputLabel, Chip,
    List, ListItem, ListItemButton, ListItemText, Collapse,
    IconButton, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow
} from '@mui/material';
import {
    Add as AddIcon, Settings as SettingsIcon,
    ExpandLess, ExpandMore, Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ReactGridLayout = WidthProvider(RGL);

// ==================== MOCK DATA ====================
const YSCM_INV_PRED_1_XML = `<?xml version="1.0" encoding="UTF-8" ?><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"> <asx:values><metadata><infoprovider>ZSCMCINVT</infoprovider><query>YSCM_INV_PRED_1</query><description>Inventory Prediciton</description></metadata><META><ZBW_QUERY_OUTPUT_METADATA type ="CHA" ><FIELDNAME>CALMONTH</FIELDNAME><SCRTEXT_L>Calendar Year/Month</SCRTEXT_L></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="CHA" ><FIELDNAME>XSLT_0O2TFPLNEXF0ML95F2Z32W3L</FIELDNAME><SCRTEXT_L>Struct.</SCRTEXT_L></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE001</FIELDNAME><SCRTEXT_L>Actual Inventory</SCRTEXT_L></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE002</FIELDNAME><SCRTEXT_L>Predicted Inventory</SCRTEXT_L></ZBW_QUERY_OUTPUT_METADATA></META> <OUTPUT><item><CALMONTH>JUL 2023</CALMONTH><O2TFPLNEXF0ML95F2Z32W3L>Projects</O2TFPLNEXF0ML95F2Z32W3L><VALUE001>1494415379.000</VALUE001><VALUE002>1494415379.000</VALUE002></item><item><CALMONTH>AUG 2023</CALMONTH><O2TFPLNEXF0ML95F2Z32W3L>Projects</O2TFPLNEXF0ML95F2Z32W3L><VALUE001>0.000</VALUE001><VALUE002>1420468011.000</VALUE002></item><item><CALMONTH>AUG 2023</CALMONTH><O2TFPLNEXF0ML95F2Z32W3L>DRILLING</O2TFPLNEXF0ML95F2Z32W3L><VALUE001>0.000</VALUE001><VALUE002>1820699230.000</VALUE002></item></OUTPUT></asx:values></asx:abap>`;

const YSCM_INVENTORY_PRED_BAR_XML = `<?xml version="1.0" encoding="UTF-8" ?><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"> <asx:values><metadata><infoprovider>ZSCMCINVT</infoprovider><query>YSCM_INVENTORY_PRED_BAR</query><description>Inventory Trend</description></metadata><META><ZBW_QUERY_OUTPUT_METADATA type ="CHA" ><FIELDNAME>ZMDMCPGRP</FIELDNAME><SCRTEXT_L>Group</SCRTEXT_L></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE001</FIELDNAME><SCRTEXT_L>Actual Inventory</SCRTEXT_L></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE002</FIELDNAME><SCRTEXT_L>Predicted Inventory</SCRTEXT_L></ZBW_QUERY_OUTPUT_METADATA></META> <OUTPUT><item><ZMDMCPGRP>DRILLING</ZMDMCPGRP><VALUE001>1991183432.000</VALUE001><VALUE002>1850166544.000</VALUE002></item><item><ZMDMCPGRP>MRO</ZMDMCPGRP><VALUE001>1152257757.000</VALUE001><VALUE002>1071682160.000</VALUE002></item><item><ZMDMCPGRP>PROJECTS</ZMDMCPGRP><VALUE001>1529571850.000</VALUE001><VALUE002>1388239595.000</VALUE002></item></OUTPUT></asx:values></asx:abap>`;

const YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITH_VAR = `<?xml version="1.0" encoding="UTF-8" ?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
        <metadata>
            <infoprovider>ZSCMSPEND</infoprovider>
            <query>YPDO_SCCT_MFR_PROFIL_SPEND_MAP</query>
            <description>YPDO_SCCT_MFR_PROFIL_SPEND_MAP</description>
        </metadata>
        <META>
            <ZBW_QUERY_OUTPUT_METADATA type ="CHA" >
                <FIELDNAME>ZSMANFPLA__0COUNTRY</FIELDNAME>
                <SCRTEXT_L>Country - PLA Manufa</SCRTEXT_L>
            </ZBW_QUERY_OUTPUT_METADATA>
            <ZBW_QUERY_OUTPUT_METADATA type ="KF" >
                <FIELDNAME>VALUE001</FIELDNAME>
                <SCRTEXT_L>Spend Value (USD)</SCRTEXT_L>
            </ZBW_QUERY_OUTPUT_METADATA>
        </META>
        <PAGING_INFO>
            <RECORD_NO>12 </RECORD_NO>
            <TOTAL_REC>12 </TOTAL_REC>
            <PAGE_NO>1 </PAGE_NO>
        </PAGING_INFO>
        <OUTPUT>
            <item>
                <ZSMANFPLA__0COUNTRY>Andorra</ZSMANFPLA__0COUNTRY>
                <VALUE001>5987566.21</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Bharain</ZSMANFPLA__0COUNTRY>
                <VALUE001>765000.00</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Germany</ZSMANFPLA__0COUNTRY>
                <VALUE001>2381872.46</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>France</ZSMANFPLA__0COUNTRY>
                <VALUE001>102099.99</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>United Kingdom</ZSMANFPLA__0COUNTRY>
                <VALUE001>20362372.81</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Italy</ZSMANFPLA__0COUNTRY>
                <VALUE001>7873222.86</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Japan</ZSMANFPLA__0COUNTRY>
                <VALUE001>4208952.97</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Netherlands</ZSMANFPLA__0COUNTRY>
                <VALUE001>34940743.92</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Saudi Arabia</ZSMANFPLA__0COUNTRY>
                <VALUE001>766247013.99</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Thailand</ZSMANFPLA__0COUNTRY>
                <VALUE001>3440616.00</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>USA</ZSMANFPLA__0COUNTRY>
                <VALUE001>38962847.41</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Not assigned</ZSMANFPLA__0COUNTRY>
                <VALUE001>457031964.42</VALUE001>
            </item>
        </OUTPUT>
    </asx:values>
</asx:abap>`;

const YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITHOUT_VAR = `<?xml version="1.0" encoding="UTF-8" ?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
        <metadata>
            <infoprovider>ZSCMSPEND</infoprovider>
            <query>YPDO_SCCT_MFR_PROFIL_SPEND_MAP</query>
            <description>YPDO_SCCT_MFR_PROFIL_SPEND_MAP</description>
        </metadata>
        <META>
            <ZBW_QUERY_OUTPUT_METADATA type ="CHA" >
                <FIELDNAME>ZSMANFPLA__0COUNTRY</FIELDNAME>
                <SCRTEXT_L>Country - PLA Manufa</SCRTEXT_L>
            </ZBW_QUERY_OUTPUT_METADATA>
            <ZBW_QUERY_OUTPUT_METADATA type ="KF" >
                <FIELDNAME>VALUE001</FIELDNAME>
                <SCRTEXT_L>Spend Value (USD)</SCRTEXT_L>
            </ZBW_QUERY_OUTPUT_METADATA>
        </META>
        <PAGING_INFO>
            <RECORD_NO>35 </RECORD_NO>
            <TOTAL_REC>35 </TOTAL_REC>
            <PAGE_NO>1 </PAGE_NO>
        </PAGING_INFO>
        <OUTPUT>
            <item>
                <ZSMANFPLA__0COUNTRY>Andorra</ZSMANFPLA__0COUNTRY>
                <VALUE001>23573903.88</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>UAE</ZSMANFPLA__0COUNTRY>
                <VALUE001>108638057.72</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Germany</ZSMANFPLA__0COUNTRY>
                <VALUE001>239462646.18</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>France</ZSMANFPLA__0COUNTRY>
                <VALUE001>414385986.03</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>United Kingdom</ZSMANFPLA__0COUNTRY>
                <VALUE001>169430571.25</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>India</ZSMANFPLA__0COUNTRY>
                <VALUE001>314966831.99</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Italy</ZSMANFPLA__0COUNTRY>
                <VALUE001>173834804.08</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Japan</ZSMANFPLA__0COUNTRY>
                <VALUE001>1145934134.88</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Netherlands</ZSMANFPLA__0COUNTRY>
                <VALUE001>1194849359.75</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Saudi Arabia</ZSMANFPLA__0COUNTRY>
                <VALUE001>12737565933.31</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>USA</ZSMANFPLA__0COUNTRY>
                <VALUE001>5679179600.84</VALUE001>
            </item>
            <item>
                <ZSMANFPLA__0COUNTRY>Not assigned</ZSMANFPLA__0COUNTRY>
                <VALUE001>25249849254.11</VALUE001>
            </item>
        </OUTPUT>
    </asx:values>
</asx:abap>`;

const YPDO_IPR_FILTER_XML = `<?xml version="1.0"?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
        <META>
            <ZBW_QUERY_OUTPUT_METADATA>
                <FIELDNAME>PLANT</FIELDNAME>
                <OUTPUTLEN>000130</OUTPUTLEN>
                <DATATYPE>CHAR</DATATYPE>
                <SCRTEXT_L>Plant</SCRTEXT_L>
            </ZBW_QUERY_OUTPUT_METADATA>
            <ZBW_QUERY_OUTPUT_METADATA>
                <FIELDNAME>PUR_GROUP</FIELDNAME>
                <OUTPUTLEN>000130</OUTPUTLEN>
                <DATATYPE>CHAR</DATATYPE>
                <SCRTEXT_L>Purchasing group</SCRTEXT_L>
            </ZBW_QUERY_OUTPUT_METADATA>
            <ZBW_QUERY_OUTPUT_METADATA>
                <FIELDNAME>MATL_GROUP</FIELDNAME>
                <OUTPUTLEN>000130</OUTPUTLEN>
                <DATATYPE>CHAR</DATATYPE>
                <SCRTEXT_L>Material group</SCRTEXT_L>
            </ZBW_QUERY_OUTPUT_METADATA>
        </META>
        <OUTPUT>
            <item>
                <MATL_GROUP>147500</MATL_GROUP>
                <PLANT>A001</PLANT>
                <PUR_GROUP>016</PUR_GROUP>
            </item>
            <item>
                <MATL_GROUP>150000</MATL_GROUP>
                <PLANT>A001</PLANT>
                <PUR_GROUP>016</PUR_GROUP>
            </item>
            <item>
                <MATL_GROUP>070000</MATL_GROUP>
                <PLANT>A001</PLANT>
                <PUR_GROUP>021</PUR_GROUP>
            </item>
            <item>
                <MATL_GROUP>151100</MATL_GROUP>
                <PLANT>A001</PLANT>
                <PUR_GROUP>026</PUR_GROUP>
            </item>
            <item>
                <MATL_GROUP>147600</MATL_GROUP>
                <PLANT>A002</PLANT>
                <PUR_GROUP>016</PUR_GROUP>
            </item>
            <item>
                <MATL_GROUP>160000</MATL_GROUP>
                <PLANT>A002</PLANT>
                <PUR_GROUP>026</PUR_GROUP>
            </item>
            <item>
                <MATL_GROUP>080000</MATL_GROUP>
                <PLANT>B001</PLANT>
                <PUR_GROUP>030</PUR_GROUP>
            </item>
            <item>
                <MATL_GROUP>090000</MATL_GROUP>
                <PLANT>B001</PLANT>
                <PUR_GROUP>030</PUR_GROUP>
            </item>
        </OUTPUT>
    </asx:values>
</asx:abap>`;

// ==================== XML PARSER ====================
const parseXMLToJSON = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const outputItems = xmlDoc.getElementsByTagName('item');
    const result = [];

    for (let item of outputItems) {
        const jsonItem = {};
        for (let child of item.children) {
            jsonItem[child.tagName] = child.textContent;
        }
        result.push(jsonItem);
    }
    return result;
};

// ==================== MIRAGE SERVER ====================
const setupMockServer = () => {
    createServer({
        routes() {
            this.namespace = 'api';

            this.get('/query/:queryName', (schema, request) => {
                const { queryName } = request.params;
                const queryString = request.url.split('?')[1] || '';

                console.log('API Request:', queryName, 'QueryString:', queryString);

                let xmlData;
                let jsonData;

                // Handle different queries
                switch (queryName) {
                    case 'YSCM_INV_PRED_1':
                        xmlData = YSCM_INV_PRED_1_XML;
                        break;
                    case 'YSCM_INVENTORY_PRED_BAR':
                        xmlData = YSCM_INVENTORY_PRED_BAR_XML;
                        break;
                    case 'YPDO_IPR_FILTER':
                        xmlData = YPDO_IPR_FILTER_XML;
                        break;
                    case 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP':
                        // Check if variables parameter exists
                        const hasVariables = queryString.includes('variables=');
                        xmlData = hasVariables
                            ? YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITH_VAR
                            : YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITHOUT_VAR;
                        console.log('Using data with variables:', hasVariables);
                        break;
                    default:
                        xmlData = YSCM_INV_PRED_1_XML;
                }

                jsonData = parseXMLToJSON(xmlData);

                return {
                    data: jsonData,
                    query: queryName,
                    hasFilters: queryString.includes('variables=')
                };
            });
        }
    });
};

// ==================== EVENT BUS (Pub-Sub Pattern) ====================
class EventBus {
    constructor() {
        this.subscribers = {};
    }

    subscribe(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);

        return () => {
            this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback);
        };
    }

    publish(eventName, data) {
        console.log('EventBus Publishing:', eventName, data);
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach(callback => callback(data));
        }
    }
}

const eventBus = new EventBus();

// ==================== ZUSTAND STORE ====================
const useStore = create((set) => ({
    widgets: [],
    layout: [],

    addWidget: (widget) => set((state) => ({
        widgets: [...state.widgets, { ...widget, id: `widget-${Date.now()}` }],
        layout: [...state.layout, {
            i: `widget-${Date.now()}`,
            x: (state.layout.length * 3) % 12,
            y: Infinity,
            w: 4,
            h: 5
        }]
    })),

    updateWidget: (id, updates) => set((state) => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    })),

    deleteWidget: (id) => set((state) => ({
        widgets: state.widgets.filter(w => w.id !== id),
        layout: state.layout.filter(l => l.i !== id)
    })),

    updateLayout: (newLayout) => set({ layout: newLayout })
}));

// ==================== EMITTER WIDGET (Filter Selection) ====================
const EmitterWidget = ({ widget, onConfigure }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterData, setFilterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchFilterData = async () => {
            if (!widget.config?.datasource) {
                setFilterData([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/query/${widget.config.datasource}`);
                const result = await response.json();
                setFilterData(result.data);
            } catch (error) {
                console.error('Error fetching filter data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilterData();
    }, [widget.config?.datasource]);

    const handleItemClick = (item) => {
        setSelectedItem(item);

        // Build SAP BW variable string based on configuration
        const variableMappings = widget.config?.variableMappings || [];
        const eventData = {};

        // Build the SAP BW variables parameter
        const variableParams = [];
        variableMappings.forEach((mapping, index) => {
            const varNum = index + 1;
            const fieldValue = item[mapping.sourceField] || '';

            variableParams.push(`VAR_NAME_${varNum}=${mapping.varName}`);
            variableParams.push(`VAR_OPERATOR_${varNum}=EQ`);
            variableParams.push(`VAR_VALUE_EXT_${varNum}=${fieldValue}`);

            // Also add to eventData for display
            eventData[mapping.varName] = fieldValue;
        });

        eventData.variables = variableParams.join('&');

        console.log('Emitting event:', widget.config?.eventName, eventData);
        eventBus.publish(widget.config?.eventName || 'filter-changed', eventData);
    };

    const filteredData = filterData.filter(item => {
        if (!searchTerm) return true;
        return Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) {
        return (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading filters...</Typography>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h6">{widget.title || 'Filter Widget'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {widget.description || 'Select to filter'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => onConfigure(widget)}>
                        <SettingsIcon />
                    </IconButton>
                </Box>

                {selectedItem && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="primary">Selected:</Typography>
                        {Object.entries(selectedItem).map(([key, value]) => (
                            <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                sx={{ mr: 0.5, mt: 0.5, color: 'black' }}
                            />
                        ))}
                    </Box>
                )}

                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{ mb: 2 }}
                />

                <TableContainer sx={{ flexGrow: 1 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {filterData[0] && Object.keys(filterData[0]).map(key => (
                                    <TableCell key={key}><strong>{key}</strong></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map((item, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: selectedItem === item ? 'action.selected' : 'inherit'
                                    }}
                                    onClick={() => handleItemClick(item)}
                                >
                                    {Object.values(item).map((value, idx) => (
                                        <TableCell key={idx}>{value}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

// ==================== LISTENER WIDGET (Chart) ====================
const ListenerWidget = ({ widget, onConfigure }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(null);

    const fetchData = useCallback(async (filterData = null) => {
        if (!widget.config?.datasource) return;

        setLoading(true);
        try {
            let url = `/api/query/${widget.config.datasource}`;

            // If filter data contains SAP BW variables, append them
            if (filterData?.variables) {
                url += `?variables=${encodeURIComponent(filterData.variables)}`;
                setAppliedFilters(filterData);
                console.log('Fetching with SAP BW variables:', url);
            } else {
                setAppliedFilters(null);
            }

            const response = await fetch(url);
            const result = await response.json();

            console.log('Listener received data:', result);

            // Transform data for charts based on the datasource
            let transformedData;

            if (widget.config.datasource === 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP') {
                transformedData = result.data.map(item => ({
                    name: item.ZSMANFPLA__0COUNTRY,
                    value: parseFloat(item.VALUE001),
                    displayValue: (parseFloat(item.VALUE001) / 1000000).toFixed(2)
                }));
            } else {
                // Default transformation
                transformedData = result.data.map(item => ({
                    name: item.O2TFPLNEXF0ML95F2Z32W3L || item.ZMDMCPGRP || item.CALMONTH,
                    actual: parseFloat(item.VALUE001 || 0) / 1000000,
                    predicted: parseFloat(item.VALUE002 || 0) / 1000000,
                    upper: parseFloat(item.VALUE003 || 0) / 1000000,
                    lower: parseFloat(item.VALUE004 || 0) / 1000000
                }));
            }

            setData(transformedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [widget.config]);

    useEffect(() => {
        fetchData();
    }, [widget.config?.datasource]);

    useEffect(() => {
        if (widget.type === 'listener' && widget.config?.listenToEvent) {
            const unsubscribe = eventBus.subscribe(
                widget.config.listenToEvent,
                (eventData) => {
                    console.log('Listener received event:', eventData);
                    fetchData(eventData);
                }
            );
            return unsubscribe;
        }
    }, [widget.type, widget.config?.listenToEvent, fetchData]);

    const renderChart = () => {
        if (!data.length) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography color="text.secondary">
                        {loading ? 'Loading...' : 'No data available'}
                    </Typography>
                </Box>
            );
        }

        const chartType = widget.config?.chartType || 'bar';
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

        switch (chartType) {
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => entry.name}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(2)}M`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {data[0]?.value !== undefined ? (
                                <Bar dataKey="value" fill="#8884d8" name="Spend (USD)" />
                            ) : (
                                <>
                                    <Bar dataKey="actual" fill="#8884d8" name="Actual" />
                                    <Bar dataKey="predicted" fill="#82ca9d" name="Predicted" />
                                </>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="upper" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} name="Upper" />
                            <Area type="monotone" dataKey="predicted" stroke="#82ca9d" fill="#82ca9d" name="Predicted" />
                            <Area type="monotone" dataKey="lower" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} name="Lower" />
                            <Area type="monotone" dataKey="actual" stroke="#8884d8" fill="#8884d8" name="Actual" />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                            <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicted" />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                        <Typography variant="h6">{widget.title || 'Listener Widget'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {widget.description || 'Chart visualization'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => onConfigure(widget)}>
                        <SettingsIcon />
                    </IconButton>
                </Box>

                {appliedFilters && (
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="primary">Applied Filters:</Typography>
                        <Box>
                            {Object.entries(appliedFilters).map(([key, value]) => (
                                key !== 'variables' && (
                                    <Chip
                                        key={key}
                                        label={`${key}: ${value}`}
                                        size="small"
                                        sx={{ mr: 0.5, mt: 0.5, color: 'black' }}
                                    />
                                )
                            ))}
                        </Box>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    {renderChart()}
                </Box>

                {data.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Records: {data.length} {appliedFilters ? '(Filtered)' : '(All)'}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

// ==================== CONFIGURATION DIALOG ====================
const ConfigDialog = ({ open, widget, onClose, onSave }) => {
    const [config, setConfig] = useState({
        title: '',
        description: '',
        type: 'emitter',
        datasource: '',
        chartType: 'bar',
        eventName: '',
        listenToEvent: '',
        variableMappings: []
    });

    useEffect(() => {
        if (widget) {
            setConfig({
                title: widget.title || '',
                description: widget.description || '',
                type: widget.type || 'emitter',
                datasource: widget.config?.datasource || '',
                chartType: widget.config?.chartType || 'bar',
                eventName: widget.config?.eventName || '',
                listenToEvent: widget.config?.listenToEvent || '',
                variableMappings: widget.config?.variableMappings || []
            });
        }
    }, [widget]);

    const handleSave = () => {
        onSave({
            ...widget,
            title: config.title,
            description: config.description,
            type: config.type,
            config: {
                datasource: config.datasource,
                chartType: config.chartType,
                eventName: config.eventName,
                listenToEvent: config.listenToEvent,
                variableMappings: config.variableMappings
            }
        });
        onClose();
    };

    const addVariableMapping = () => {
        setConfig(prev => ({
            ...prev,
            variableMappings: [...prev.variableMappings, {
                varName: '',
                sourceField: '',
                operator: 'EQ'
            }]
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Configure Widget</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={config.title}
                            onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={config.description}
                            onChange={(e) => setConfig({ ...config, description: e.target.value })}
                            multiline
                            rows={2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Widget Type</InputLabel>
                            <Select
                                value={config.type}
                                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                                label="Widget Type"
                            >
                                <MenuItem value="emitter">Emitter (Filter)</MenuItem>
                                <MenuItem value="listener">Listener (Chart)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {config.type === 'emitter' && (
                        <>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Datasource</InputLabel>
                                    <Select
                                        value={config.datasource}
                                        onChange={(e) => setConfig({ ...config, datasource: e.target.value })}
                                        label="Datasource"
                                    >
                                        <MenuItem value="YPDO_IPR_FILTER">YPDO_IPR_FILTER (Filters)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Event Name"
                                    value={config.eventName}
                                    onChange={(e) => setConfig({ ...config, eventName: e.target.value })}
                                    placeholder="e.g., filter-changed"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    SAP BW Variable Mappings
                                </Typography>
                                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                    Map source fields to SAP BW variables (e.g., PLANT → YCOM_ML)
                                </Typography>
                                {config.variableMappings.map((mapping, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <TextField
                                            size="small"
                                            label="SAP BW Variable Name"
                                            value={mapping.varName}
                                            onChange={(e) => {
                                                const newMappings = [...config.variableMappings];
                                                newMappings[index].varName = e.target.value;
                                                setConfig({ ...config, variableMappings: newMappings });
                                            }}
                                            placeholder="e.g., YCOM_ML"
                                            sx={{ flex: 1 }}
                                        />
                                        <TextField
                                            size="small"
                                            label="Source Field"
                                            value={mapping.sourceField}
                                            onChange={(e) => {
                                                const newMappings = [...config.variableMappings];
                                                newMappings[index].sourceField = e.target.value;
                                                setConfig({ ...config, variableMappings: newMappings });
                                            }}
                                            placeholder="e.g., PLANT"
                                            sx={{ flex: 1 }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setConfig({
                                                    ...config,
                                                    variableMappings: config.variableMappings.filter((_, i) => i !== index)
                                                });
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button size="small" onClick={addVariableMapping} startIcon={<AddIcon />}>
                                    Add Variable Mapping
                                </Button>
                            </Grid>
                        </>
                    )}

                    {config.type === 'listener' && (
                        <>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Datasource</InputLabel>
                                    <Select
                                        value={config.datasource}
                                        onChange={(e) => setConfig({ ...config, datasource: e.target.value })}
                                        label="Datasource"
                                    >
                                        <MenuItem value="YSCM_INV_PRED_1">YSCM_INV_PRED_1</MenuItem>
                                        <MenuItem value="YSCM_INVENTORY_PRED_BAR">YSCM_INVENTORY_PRED_BAR</MenuItem>
                                        <MenuItem value="YPDO_SCCT_MFR_PROFIL_SPEND_MAP">YPDO_SCCT_MFR_PROFIL_SPEND_MAP</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Chart Type</InputLabel>
                                    <Select
                                        value={config.chartType}
                                        onChange={(e) => setConfig({ ...config, chartType: e.target.value })}
                                        label="Chart Type"
                                    >
                                        <MenuItem value="line">Line Chart</MenuItem>
                                        <MenuItem value="bar">Bar Chart</MenuItem>
                                        <MenuItem value="area">Area Chart</MenuItem>
                                        <MenuItem value="pie">Pie Chart</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Listen to Event"
                                    value={config.listenToEvent}
                                    onChange={(e) => setConfig({ ...config, listenToEvent: e.target.value })}
                                    placeholder="e.g., filter-changed"
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

// ==================== MAIN DASHBOARD ====================
const Dashboard = () => {
    const { widgets, layout, addWidget, updateWidget, deleteWidget, updateLayout } = useStore();
    const [configOpen, setConfigOpen] = useState(false);
    const [selectedWidget, setSelectedWidget] = useState(null);

    const handleAddWidget = (type) => {
        addWidget({
            type,
            title: type === 'emitter' ? 'New Filter Widget' : 'New Chart Widget',
            description: '',
            config: {}
        });
    };

    const handleConfigure = (widget) => {
        setSelectedWidget(widget);
        setConfigOpen(true);
    };

    const handleSaveConfig = (updatedWidget) => {
        updateWidget(updatedWidget.id, updatedWidget);
    };

    return (
        <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard Builder - SAP BW Event-Driven Widgets
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Create emitter widgets (filters) that publish events, and listener widgets (charts) that respond to these events with SAP BW variable support
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddWidget('emitter')}
                    >
                        Add Filter Widget (Emitter)
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddWidget('listener')}
                    >
                        Add Chart Widget (Listener)
                    </Button>
                </Box>
            </Paper>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {widgets.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            No widgets added yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click the buttons above to add widgets to your dashboard
                        </Typography>
                    </Paper>
                ) : (
                    <ReactGridLayout
                        className="layout"
                        layout={layout}
                        cols={12}
                        rowHeight={80}
                        onLayoutChange={(newLayout) => updateLayout(newLayout)}
                        draggableHandle=".drag-handle"
                    >
                        {widgets.map((widget) => (
                            <div key={widget.id} style={{ background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                                <Box
                                    className="drag-handle"
                                    sx={{
                                        cursor: 'move',
                                        bgcolor: widget.type === 'emitter' ? 'primary.main' : 'secondary.main',
                                        color: 'white',
                                        p: 0.5,
                                        textAlign: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ⋮⋮ DRAG HERE ⋮⋮
                                </Box>
                                <Box sx={{ height: 'calc(100% - 28px)' }}>
                                    {widget.type === 'emitter' ? (
                                        <EmitterWidget widget={widget} onConfigure={handleConfigure} />
                                    ) : (
                                        <ListenerWidget widget={widget} onConfigure={handleConfigure} />
                                    )}
                                </Box>
                            </div>
                        ))}
                    </ReactGridLayout>
                )}
            </Box>

            <ConfigDialog
                open={configOpen}
                widget={selectedWidget}
                onClose={() => setConfigOpen(false)}
                onSave={handleSaveConfig}
            />
        </Box>
    );
};

// ==================== APP ====================
const App = () => {
    useEffect(() => {
        setupMockServer();
    }, []);

    return <Dashboard />;
};

export default App;