import { createServer, Response } from 'miragejs';
import inventoryQueries from '../queries/inventory';
import logisticsQueries from '../queries/logistics';
import otherQueries from '../queries/otherQueries';
import procurementQueries from '../queries/procurement';
import { AnyResponse } from 'miragejs/-types';
import Schema from 'miragejs/orm/schema';

interface ApiEndpoint {
    id: string;
    name: string;
    url: string;
}

interface Entity {
    id: string;
    name: string;
    properties: string[];
}
// Mock data
const mockApiEndpoints: ApiEndpoint[] = [
    { id: 'contracts', name: 'Contracts API', url: '/api/contracts' },
    { id: 'suppliers', name: 'Suppliers API', url: '/api/suppliers' },
    { id: 'invoices', name: 'Invoices API', url: '/api/invoices' },
];

const mockEntities: Record<string, Entity[]> = {
    contracts: [
        {
            id: 'contract',
            name: 'Contract',
            properties: ['ContractID', 'Title', 'StartDate', 'EndDate', 'Value', 'Status'],
        },
        {
            id: 'amendment',
            name: 'Amendment',
            properties: ['AmendmentID', 'ContractID', 'ChangeDate', 'ChangeType', 'ChangeDescription'],
        },
    ],
    suppliers: [
        {
            id: 'supplier',
            name: 'Supplier',
            properties: ['SupplierID', 'Name', 'Category', 'Rating', 'ContactPerson', 'Email', 'Phone'],
        },
        {
            id: 'address',
            name: 'Address',
            properties: ['AddressID', 'SupplierID', 'Street', 'City', 'State', 'Country', 'PostalCode'],
        },
    ],
    invoices: [
        {
            id: 'invoice',
            name: 'Invoice',
            properties: [
                'InvoiceID',
                'ContractID',
                'SupplierID',
                'Amount',
                'Status',
                'DueDate',
                'PaidDate',
            ],
        },
        {
            id: 'lineItem',
            name: 'Line Item',
            properties: ['LineItemID', 'InvoiceID', 'Description', 'Quantity', 'UnitPrice', 'TotalPrice'],
        },
    ],
};

// MirageJS mock API server
const mirageServer = (environment = 'development') => {
    return createServer({
        timing: 1500,
        environment,
        routes() {
            this.namespace = 'api';

            this.get('/endpoints', () => {
                return { endpoints: mockApiEndpoints };
            });

            this.get('/entities', (schema, request) => {
                const endpointId = request.queryParams.endpointId as string;
                return {
                    entities: endpointId && mockEntities[endpointId] ? mockEntities[endpointId] : [],
                };
            });
            // Allow all external API requests (full URLs) to pass through
            // Only intercept local API requests (relative URLs starting with /api)
            this.passthrough((request) => {
                const url = request.url;
                // If it's a full URL (starts with http:// or https://), let it pass through
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    return true;
                }
                // For relative URLs, only pass through if they don't start with /api
                return !url.startsWith('/api');
            });
            this.get('/properties', (schema, request) => {
                const endpointId = request.queryParams.endpointId as string;
                const entityId = request.queryParams.entityId as string;

                if (endpointId && entityId && mockEntities[endpointId]) {
                    const entity = mockEntities[endpointId].find((e) => e.id === entityId);
                    return { properties: entity?.properties || [] };
                }
                return { properties: [] };
            });
            this.get('/dashboard', () => {
                const savedLayout = sessionStorage.getItem('payload') || '[]';
                return {
                    sections: JSON.parse(savedLayout),
                };
            });

            this.post('/dashboard', (schema, request) => {
                const data = JSON.parse(request.requestBody);
                sessionStorage.setItem('payload', JSON.stringify(data.sections));
                return { success: true };
            });
            /*  this.get(
                       "/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm",
                       (schema, request) => {
                           const query = request.queryParams.query;
                           if (query === "YSCM_CT_PROC_OSS") {
                               const xmlResponse = `<?xml version="1.0" encoding="UTF-8" ?><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"> <asx:values><metadata><infoprovider>ZSCSMPMI</infoprovider><query>YSCM_CT_PROC_OSS</query><description>Outsourced Inventory Report</description><author>SID_BWSCM_01</author><changed_by>SID_BWSCM_01</changed_by><changed_on>04/24/2022 12:34:43</changed_on><current_user>SID_BWSRV_01</current_user><load_date>12/21/2022 11:24:17</load_date></metadata>< META ><ZBW_QUERY_OUTPUT_METADATA type ="CHA" ><FIELDNAME>ZSCMCMD</FIELDNAME><OUTPUTLEN>000005</OUTPUTLEN><DATATYPE>CHAR</DATATYPE><SCRTEXT_L>OSS INV - Commodity</SCRTEXT_L><AXIS_TYPE>ROW</AXIS_TYPE><TYPE>CHA</TYPE><DISPLAY_STYLE>5</DISPLAY_STYLE></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE001</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - Value</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK18H83</ELEM></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE002</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - &lt;6 Months</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK18NJN</ELEM></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE003</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - 6-12 Months</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK18TV7</ELEM></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE004</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - &gt;12 Months</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK1906R</ELEM></ZBW_QUERY_OUTPUT_METADATA></META> <PAGING_INFO><RECORD_NO>5 </RECORD_NO><TOTAL_REC>5 </TOTAL_REC><PAGE_NO>1 </PAGE_NO></PAGING_INFO><OUTPUT><item><ZSCMCMD>OCTG</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>51.400</VALUE002><VALUE003>13.500</VALUE003><VALUE004>0.000</VALUE004></item><item><ZSCMCMD>Mud &amp; Chemical</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>277.000</VALUE002><VALUE003>38.800</VALUE003><VALUE004>1.800</VALUE004></item><item><ZSCMCMD>Downhole</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>352.100</VALUE002><VALUE003>123.500</VALUE003><VALUE004>0.000</VALUE004></item><item><ZSCMCMD>Line Poles and Hware</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>0.000</VALUE002><VALUE003>0.000</VALUE003><VALUE004>0.000</VALUE004></item><item><ZSCMCMD>Overall Result</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>680.500</VALUE002><VALUE003>175.800</VALUE003><VALUE004>1.800</VALUE004></item></OUTPUT></asx:values></asx:abap>`;
                               const parsedResponse = parseXMLToJson(
                                   xmlResponse
                               ) as FormTransformInputType;
                               console.log(
                                   "TransformedResponse",
                                   transformFormMetadata(parsedResponse)
                               );
                               console.log(parsedResponse);
                               return parsedResponse;
                           }
                           return { error: "Invalid query parameter" };
                       }
                   ); */
            this.get('/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm', (schema, req) => {
                const { queryParams } = req;

                /**
                 * @constant
                 * @type { keyof inventoryQueries | keyof logisticsQueries | keyof procurementQueries | keyof otherQueries}
                 */
                const query = queryParams.query;

                switch (query) {
                    case 'YPDO_IPR_FILTER_XML':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITH_VAR':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP_WITHOUT_VAR':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_INV_ACT_IQR_CRP_TRND_Q001':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YPDO_CT_INV_UPCOM_PO_DTL':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YPDO_CT_INV_UPCOM_PO':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_TREND':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_IQR_DSHBRD':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_IQR':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YCUS_CT_INV_CUST_PORF':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YWHO_CT_INV_ST_ADJS_BLKD':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_OUT_OF_STOCK':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_SCCT_POTENTIAL_SLOW':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YCUS_SCCT_INV_OVERDUE':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YWHO_CT_INV_STG_OVERDUE':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_ERROR_KPI':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_ERROR_DRILLING_KPI':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_ERROR_PROJECT_KPI':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YSCM_SC_MANUAL_TARGET':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_INVENTORY_LEVEL_SCCT':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YWHO_CT_INV_ST_ADJS_BLKD_PR':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YWHO_CT_INV_ORDUE':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YWHO_CT_INV_ST_ADJS_BLKD_M_PLA':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YWHO_CT_INV_ST_ADJS_BLKD_CUST':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YSCM_SCCT_INV_ALERT1':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YSCM_SCCT_INV_ALERT2':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'Y_SCM_CT_ALERT_KPI_TREND_DEMO':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YCUS_SCCT_INV_OVERDUE_DTL':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_SCCT_POTENTIAL_SLOW_DTL':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'Y_TEST_MAP':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YSCM_INV_PRED':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YSCM_INVENTORY_PRED_01':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YSCM_INV_PRED_1':
                        return new Response(200, { 'content-type': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_SOTD_PRED_01':
                        return new Response(200, { 'content-type': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SOTD_PRED__TEST':
                        return new Response(200, { 'content-type': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_INVENTORY_PRED_BAR':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_CT_INV_OUT_OF_STOCK_DTL1':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YSCM_SCCT_INV_ALERT1_DTL':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_INV_TRND_DET_SLOW':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_INV_TRND_NONMOV':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_INV_TRND_DET_SLOW2':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);
                    case 'YIMO_INV_TRND_NONMOV2':
                        return new Response(200, { 'content-type': 'text/xml' }, inventoryQueries[query]);

                    /**************************** LOGISTICS AND WAREHOUSE ****************************/
                    case 'YWHO_CT_WH_WL_SUMM':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_SC_MANUAL_TARGET':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_WH_GLD_WORKLOD':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YPDO_CT_LOG_IK_WORKLOD':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YCUS_CT_WH_OTD_SC':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YCUS_CT_LOG_OTD_SUMM':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_LOG_OPEN_CLM':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YWHO_CT_WH_BLKD_INV':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YWHO_CT_INV_OVER_STOCK_ADJ':
                        return new Response(200, { 'content-type': 'text/xml' }, logisticsQueries[query]);
                    case 'YPDO_SCCT_BULK_DEL_OOK':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YPDO_CT_LOG_PENDNIG_GRS':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YPDO_CT_LOG_PENDNIG_GR_1':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YPDO_CT_LOG_PENDNIGGRS':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);

                    case 'YWHE_CT_LOG_UNCONFM_TO':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_WH_FCN_ITEMS':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YIME_CT_LOG_SHELF_LIFE':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_LOG_HT_EMER':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_LOG_HT_EMER_ASN':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YIMO_CT_LOG_RETURN_MATRIAL':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YIMO_CT_LOG_SHELF_LIFE':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YPDO_SCCT_BULK_DEL_IK':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_WH_ALERTS':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_LOG_TOS_CANCELED':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YWHE_CT_LOG_URG_ASN':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YWHO_CT_INV_OVER_ST_ADJ':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CARBON_FPRINT':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_SCCT_SH_INDEX_01':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);

                    case 'YSCM_CT_EXT_ASSIGN_map':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YPDO_SCCT_BULK_DEL_IK_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_EMP_EXTER_ASSIGNM_01':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YSCM_CT_EMP_EXTER_ASSIGNMENT':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    case 'YIMO_CT_LOG_SHELF_LIFE_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, logisticsQueries[query]);
                    /**************************** PROCUREMENT ****************************/
                    case 'YPDO_CT_PROC_OTD_BUYER':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_PROC_OTD_BUYER_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_PROC_OTD_SUPPLIER':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_PROC_LOCAL_MANUF':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDE_CT_PROC_SPEND_MANGMENT':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_IKTIVA_KPI':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_SINGLE_SOURCE':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDPLN_CT_PROC_PROJ_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'yscm_scct_sourc_inv':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_SOURCING_GAP_BY_CON':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_SOURCING_GAP_BY_COM':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);

                    case 'YSCM_SCCT_INV_BY_COUNTRY':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);

                    case 'YSCM_SCCT_INV_BY_COMMODITY':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDPLN_CT_PROC_CONTR_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDE_CT_PROC_CONSUMED_PAS':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCUS_CT_PROC_EMRG_PR':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_PROC_PO_TO_RELEASE':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_NA_CONTRACT':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDIK_CT_PROG_INV_PROG_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDE_CT_PROC_PA_NEAR_EXPIR':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_PROC_OPEN_VER_PO':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_TREND_CON_SCON':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_CONS_CONT':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_PROC_OD_PO':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDE_CT_PROC_TIME_ANA':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_TREND_PROC_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_PCR':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_TREND_PEN_CON':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDREP_PEND_COMPL_REVIEW_CT':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_PROC_CONTRACTOR':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCUS_PSCCT_EGR_AGED':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_BP_PLAHIST_PSCM_DASHBOARD':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SPEND_COUNTRY':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SPEND_CON_SRV':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_MSPEND_CONT_00':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_MSPEND_COM_00':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_INDIRECT_COUNTRY':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SPEND_COUNTRIES':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SPEND_YTD':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SPEND_L5Y':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCUS_SCCT_PROC_EGR_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDIK_SCCT_PROC_SES_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCUS_MOB_PROC_EGR_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_PSCCT_PROC_SES_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFIL_SPEND_MAP':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_PROC_IKTIVA':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_IKTIVA_VALUE':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_SINGLE_SLFC':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDEXDB_CT_PROC_SFCMFC':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_PROC_CT_SNG_MAT':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDP_CT_PROC_CLAIM':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_PROC_SUMMARY':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDS_SCCT_SPEND_MAT_COM_APD':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_MATSPEND':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SRVSPEND':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_COST':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_INVOICE_MONTHLY':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_LEAD_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_TOP':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_OSS':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_LOSTOPP':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_LOSTOPP_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_CT_LOST_OPR_SUM':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_PROC_RPA':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_PROC_RPA_01':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SS_TREND':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDP_CT_PROC_CLAIM_TREND':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_PRC_PMI':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SPEND_BK':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_SPEND_SBK':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_ALERT_TRK_01':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_ALERT_TRK_02':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_ALERT_TRK_03':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_ALERT_TRK_04':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_MSPENDT_COM_00':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_SCCT_INDIRECT_COMMODITY':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_PROC_CONTRACT_SPEND':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_01':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_02':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_03':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_04':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_05':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_06':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_07':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_08':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YPDO_SCCT_MFR_PROFILE_09':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YCDIK_CT_PROG_INV_PR_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CT_GSCPI':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_PSCCT_AIRFREIGHT':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CAPACITY_MNGT':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CM_MAIN':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_CM_MAIN1':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_KPI_TEST__1':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);

                    case 'YSCM_AOC_MSPEND_CONT_00':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_AOC_MSPEND_COM_00':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_AOC_PROC_SPEND_SBK':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_ASC_MSPEND_CONT_00':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_ASC_MSPEND_COM_00':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_AOC_PROC_SPEND_YTD':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_ASC_PROC_SPEND_BK':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_ASC_PROC_SPEND_YTD':
                        return new Response(200, { 'content-typ': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_OOK_AOCCT_PROC_SPEND_SBK':
                        return new Response(200, { 'content-type': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_OOK_AOCCT_PROC_SPEND_BK':
                        return new Response(200, { 'content-type': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_PSCCT_SPENEPM':
                        return new Response(200, { 'content-type': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_INDRCTSPEND_COUNTRY':
                        return new Response(200, { 'content-type': 'text/xml' }, procurementQueries[query]);
                    case 'YSCM_OOK_ASCCT_SRCING_GAP_CNRY':
                        return new Response(200, { 'content-type': 'text/xml' }, procurementQueries[query]);
                    /**************************** Other Queries ****************************/
                    case 'YCUS_ON_HAND_INV_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_SCCT_RSSFEED':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_OVRDU_RSRV':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_INV_STOCK_OUT':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_POTEN_SLOW':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_BLOCK_INVENT':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_RTRND_INV':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_EMER_WO_ASN':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_EMER_WO_POD':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_IK_BULKY':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_OOK_BULKY':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_FCN_WH':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_EXP_SHEL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_UNCONF_TOS':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_PEND_STOCK':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_NON_COMP':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_PO_TO_RELES':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_CONS_CONTRA':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_OPEN_VER_PO':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_OPEN_DEL_REQ':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_EMER_PR':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_PROC_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_PEND_CONTRA':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_EXPIRY_PAS':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_PEND_SES':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_TREND_COMPL_ACT':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YCUS_ON_HAND_INV_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YCUS_ON_HAND_INV_DTL_02':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    // kpis
                    case 'YPDO_BP_PLAHIST_NEW_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YCDPLN_CT_PROC_CONTR_TIME_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YCDPLN_CT_PROC_PROJ_TIME_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YPDO_OTD_SUPPLIER_DETAIL_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YPDO_OTD_SUPPLIER_DETAIL_TRD':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_LGO_OTD_WH_DETAIL_DRL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YWHO_OTD_WH_DETAIL_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YWHO_OTD_WH_DETAIL_DTL_TRD':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YIMO_CT_INV_ERROR_DRILLING_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YIMO_CT_INV_ERROR_PROJECT_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YIMO_CT_INV_IQR_MRO_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YIMO_CT_INV_IQR_PROJ_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YIMO_CT_INV_IQR_DRL_DTL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_KPI_TEST':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YCDCR_LFC_TEXT_MOB':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CIRCULAR_ECO':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_INV_PRED_1':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YIMO_MOB_PROC_SES_TIME':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YPDO_CT_MOB_CO2_TEST':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YPDO_MOB_COUNTRY_SPEND':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_CT_LOSTOPP':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);

                    case 'YSCM_SCCT_OPD_TRACK':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_EXT_FORNT_LINE_OTD_REPORT':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_EXPEDITING_REPORT_DETAIL':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    case 'YSCM_SUST_SUPP':
                        return new Response(200, { 'content-typ': 'text/xml' }, otherQueries[query]);
                    default:
                        return new Response(200, { 'content-typ': 'text/xml' }, '');
                }
            });
        },
    });
};

export default mirageServer;
