import { useState, useEffect } from 'react';
import { sapODataService, Section } from '@/services/sapODataService';
import { DashboardData } from '../types/dashboard';
import { transformSectionsToUIFormat } from '../utils/dashboardUtils';

export const useDashboardData = (tabId: string) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    sections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sapSections, setSapSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching sections for tab ID: ${tabId}`);

        const sections = await sapODataService.fetchSectionsByTabId(tabId);
        console.log('Fetched sections from SAP:', sections);

        setSapSections(sections);
        const transformedSections = transformSectionsToUIFormat(sections);
        setDashboardData({ sections: transformedSections });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard configuration from SAP');
        setLoading(false);
        setDashboardData({ sections: [] });
      }
    };

    if (tabId) {
      fetchDashboardData();
    }
  }, [tabId]);

  const updateDashboardData = (sections: Section[]) => {
    setSapSections(sections);
    const transformedSections = transformSectionsToUIFormat(sections);
    setDashboardData({ sections: transformedSections });
  };

  return {
    dashboardData,
    setDashboardData,
    sapSections,
    setSapSections,
    loading,
    setLoading,
    error,
    setError,
    updateDashboardData,
  };
};
