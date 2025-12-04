import { useMemo } from 'react';

interface UseEditModeProps {
    isAdmin: boolean;
    urlParams: URLSearchParams | null;
}

export const useEditMode = ({ isAdmin, urlParams }: UseEditModeProps) => {
    const isEditModeAllowed = useMemo(() => {
        if (!isAdmin) return false;
        return urlParams?.get('view') === 'edit';
    }, [isAdmin, urlParams]);

    const isStandaloneAllowed = useMemo(() => {
        return !!urlParams?.get('appId');
    }, [urlParams]);

    return {
        isEditModeAllowed,
        isStandaloneAllowed,
    };
};

