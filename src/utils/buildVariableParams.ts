

import type { FilterValue, HierarchyNodeValue } from '@/store/filterSlice';

function isHierarchyNodeValue(value: unknown): value is HierarchyNodeValue {
    return (
        typeof value === 'object' &&
        value !== null &&
        'nodeKey' in value &&
        'nodeIObjNm' in value
    );
}

export const buildVariableParams: any = (variables: Record<string, FilterValue>): string | undefined => {
    const variableParams: string[] = [];
    let varNum = 1;

    // A hierarchy-node restriction is passed by node key + node InfoObject name
    // (VAR_NODE_IOBJNM) and, unlike a value restriction, carries no operator.
    // Example: VAR_NAME_1=ZSCAI_CC1&VAR_VALUE_EXT_1=999930002978&VAR_NODE_IOBJNM_1=0HIER_NODE
    const pushHierarchyNode = (varName: string, node: HierarchyNodeValue) => {
        const key = String(node.nodeKey ?? '').trim();
        if (key === '' || !node.nodeIObjNm) return;
        variableParams.push(`VAR_NAME_${varNum}=${varName}`);
        variableParams.push(`VAR_VALUE_EXT_${varNum}=${key}`);
        variableParams.push(`VAR_NODE_IOBJNM_${varNum}=${node.nodeIObjNm}`);
        varNum++;
    };

    Object.entries(variables).forEach(([varName, value]) => {
        if (!varName || value === null || value === undefined) return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'string' && value.trim() === '') return;
        if (isHierarchyNodeValue(value)) {
            pushHierarchyNode(varName, value);
            return;
        }
        if (typeof value === 'object' && !Array.isArray(value) && 'from' in value && !value.from && !value.to) return;

        if (Array.isArray(value)) {
            value.forEach((val) => {
                if (isHierarchyNodeValue(val)) {
                    pushHierarchyNode(varName, val);
                    return;
                }
                if (val === null || val === undefined || String(val).trim() === '') return;
                variableParams.push(`VAR_NAME_${varNum}=${varName}`);
                variableParams.push(`VAR_OPERATOR_${varNum}=EQ`);
                variableParams.push(`VAR_VALUE_EXT_${varNum}=${String(val)}`);
                varNum++;
            });
            return;
        }

        if (typeof value === 'object' && 'from' in value) {
            variableParams.push(`VAR_NAME_${varNum}=${varName}`);
            variableParams.push(`VAR_OPERATOR_${varNum}=BT`);
            variableParams.push(`VAR_VALUE_LOW_EXT_${varNum}=${value.from || ''}`);
            variableParams.push(`VAR_VALUE_HIGH_EXT_${varNum}=${value.to || ''}`);
            varNum++;
            return;
        }

        variableParams.push(`VAR_NAME_${varNum}=${varName}`);
        variableParams.push(`VAR_OPERATOR_${varNum}=EQ`);
        variableParams.push(`VAR_VALUE_EXT_${varNum}=${String(value)}`);
        varNum++;
    });

    return variableParams.length > 0 ? variableParams.join('&') : undefined;
};
