/**
 * Parses XML response from SAP BW report to JSON format
 * This is a simplified version for demonstration - in a real implementation
 * you would use a proper XML parser
 *
 * @param xmlString - Raw XML string from SAP BW
 * @returns Parsed and transformed JSON object
 */
export function parseXMLToJson(xmlString: string): any {
    // This is a simplified demonstration - in production, use a proper XML parser
    try {
        // Extract header metadata
        const header = extractMetadata(xmlString);

        // Extract chart data
        const chartData = extractChartData(xmlString);
        console.log('Chart Data:', {
            header,
            chartData,
        });
        return {
            header,
            chartData,
        };
    } catch (error) {
        console.error('Error parsing XML to JSON:', error);
        return { error: 'Failed to parse XML response' };
    }
}

/**
 * Extract metadata from XML string
 *
 * @param xmlString - Raw XML string
 * @returns Array of header metadata objects
 */
function extractMetadata(xmlString: string): any[] {
    const metadataMatches = xmlString.match(
        /<ZBW_QUERY_OUTPUT_METADATA[^>]*>([\s\S]*?)<\/ZBW_QUERY_OUTPUT_METADATA>/g
    );

    if (!metadataMatches) return [];

    return metadataMatches.map((metadataBlock) => {
        const typeMatch = metadataBlock.match(/type\s*=\s*"([^"]+)"/);
        const type = typeMatch ? typeMatch[1] : "";

        // Extract and clean field name
        const fieldNameMatch = metadataBlock.match(/<FIELDNAME>([^<]+)<\/FIELDNAME>/);
        let fieldName = fieldNameMatch ? decodeXmlEntities(fieldNameMatch[1]) : "";

        // remove XSLT_ prefix if present
        if (fieldName.startsWith("XSLT_")) {
            fieldName = fieldName.replace(/^XSLT_/, "");
        }

        // Extract label
        const labelMatch = metadataBlock.match(/<SCRTEXT_L>([^<]+)<\/SCRTEXT_L>/);
        const label = labelMatch ? decodeXmlEntities(labelMatch[1]) : "";

        const axisTypeMatch = metadataBlock.match(/<AXIS_TYPE>([^<]+)<\/AXIS_TYPE>/);
        const axisType = axisTypeMatch ? axisTypeMatch[1] : "";

        const displayStyleMatch = metadataBlock.match(/<DISPLAY_STYLE>([^<]+)<\/DISPLAY_STYLE>/);
        const displayStyle = displayStyleMatch ? displayStyleMatch[1] : "";

        console.log("Field Name:", fieldName);

        return { type, fieldName, label, axisType, displayStyle };
    });
}

/**
 * Extract chart data from XML string
 *
 * @param xmlString - Raw XML string
 * @returns Array of data objects
 */
function extractChartData(xmlString: string): any[] {
    const outputSectionMatch = xmlString.match(/<(OUTPUT|o)>([\s\S]*?)<\/(OUTPUT|o)>/);
    if (!outputSectionMatch) return [];

    const outputSection = outputSectionMatch[0];
    const itemMatches = outputSection.match(/<item>([\s\S]*?)<\/item>/g);
    if (!itemMatches) return [];

    return itemMatches.map((itemBlock) => {
        const dataObject: any = {};
        const fieldPattern = /<([^>]+)>([^<]*)<\/\1>/g;
        let match;

        while ((match = fieldPattern.exec(itemBlock)) !== null) {
            let fieldName = match[1];
            let fieldValue: any = match[2];

            // remove XSLT_ prefix if present in output data
            if (fieldName.startsWith("XSLT_")) {
                fieldName = fieldName.replace(/^XSLT_/, "");
            }

            // Try to convert numeric values
            if (!isNaN(Number(fieldValue)) && fieldValue.trim() !== "") {
                fieldValue = Number(fieldValue);
            }

            dataObject[fieldName] = fieldValue;
        }

        return dataObject;
    });
}
/**
 * Utility to render XML entities
 *
 * @param text - Text with XML entities
 * @returns Text with rendered entities
 */
function decodeXmlEntities(text: string): string {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
}
