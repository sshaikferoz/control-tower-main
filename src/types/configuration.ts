export interface UIConfiguration {
  background: {
    enabled: boolean;
    imageUrl: string;
    imageBase64: string;
    useBase64: boolean;
    opacity: number;
  };
  chatbot: {
    enabled: boolean;
    position: string; // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    color: string;
  };
  search: {
    enabled: boolean;
    placeholder: string;
  };
  branding: {
    logoUrl: string;
    logoBase64: string;
    useLogoBase64: boolean;
    appName: string;
    primaryColor: string;
  };
}

export const defaultConfiguration: UIConfiguration = {
  background: {
    enabled: true,
    imageUrl: `${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png`,
    imageBase64: '',
    useBase64: false,
    opacity: 100,
  },
  chatbot: {
    enabled: false,
    position: 'bottom-right',
    color: '#83BD01',
  },
  search: {
    enabled: false,
    placeholder: 'Search My Contract, Spend, Notification, Localization, KPI',
  },
  branding: {
    logoUrl: '',
    logoBase64: '',
    useLogoBase64: false,
    appName: 'mySCAI',
    primaryColor: '#0164B0',
  },
};
