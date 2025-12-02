import React from 'react';
import { ConfigurationDialog } from '@/components/dialogs/ConfigurationDialog';
import { UIConfiguration } from '@/types/configuration';

interface DashboardConfigurationProps {
    visible: boolean;
    isEditModeAllowed: boolean;
    configuration: UIConfiguration;
    onHide: () => void;
    onSave: (config: UIConfiguration) => Promise<boolean>;
    onReset: () => Promise<void>;
}

export const DashboardConfiguration: React.FC<DashboardConfigurationProps> = ({
    visible,
    isEditModeAllowed,
    configuration,
    onHide,
    onSave,
    onReset,
}) => {
    if (!isEditModeAllowed) {
        return null;
    }

    return (
        <ConfigurationDialog
            visible={visible}
            onHide={onHide}
            configuration={configuration}
            onSave={onSave}
            onReset={onReset}
        />
    );
};

