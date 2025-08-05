import { useState, useEffect } from 'react';
import { sapODataService } from '../services/sapODataService';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setAdminCheckLoading(true);
        setAdminCheckError(null);
        const adminStatus = await sapODataService.checkAdminRole();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setAdminCheckError('Failed to check admin permissions');
        setIsAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, adminCheckLoading, adminCheckError };
};
