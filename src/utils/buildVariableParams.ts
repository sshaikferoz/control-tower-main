

import type { FilterValue } from '@/store/filterSlice';

export const buildVariableParams: any = (variables: Record<string, FilterValue>): string | undefined => {
    const variableParams: string[] = [];
    let varNum = 1;

    Object.entries(variables).forEach(([varName, value]) => {
        if (!varName || value === null || value === undefined) return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'string' && value.trim() === '') return;
        if (typeof value === 'object' && 'from' in value && !value.from && !value.to) return;

        if (Array.isArray(value)) {
            value.forEach((val) => {
                if (val === null || val === undefined || String(val).trim() === '') return;
                variableParams.push(`VAR_NAME_${varNum}=${varName}`);
                variableParams.push(`VAR_OPERATOR_${varNum}=EQ`);
                variableParams.push(`VAR_VALUE_EXT_${varNum}=${String(val)}`);
                varNum++;
            });
            return;
        }

        if (typeof value === 'object' && 'from' in value) {
            if (value.from) {
                variableParams.push(`VAR_NAME_${varNum}=${varName}`);
                variableParams.push(`VAR_OPERATOR_${varNum}=GE`);
                variableParams.push(`VAR_VALUE_EXT_${varNum}=${value.from}`);
                varNum++;
            }
            if (value.to) {
                variableParams.push(`VAR_NAME_${varNum}=${varName}`);
                variableParams.push(`VAR_OPERATOR_${varNum}=LE`);
                variableParams.push(`VAR_VALUE_EXT_${varNum}=${value.to}`);
                varNum++;
            }
            return;
        }

        variableParams.push(`VAR_NAME_${varNum}=${varName}`);
        variableParams.push(`VAR_OPERATOR_${varNum}=EQ`);
        variableParams.push(`VAR_VALUE_EXT_${varNum}=${String(value)}`);
        varNum++;
    });

    return variableParams.length > 0 ? variableParams.join('&') : undefined;
};

