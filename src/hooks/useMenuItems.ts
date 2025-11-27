import { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { sapODataService } from '@/services/sap/client';

export const useMenuItems = (isAdmin: boolean, adminCheckLoading: boolean) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMenuItems = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const items = await sapODataService.fetchMenuItems();
                if (items.length === 0) {
                    setMenuItems([]);
                } else {

                    setMenuItems(items.sort((a, b) => a.order - b.order));
                }
            } catch (error) {
                console.error('Error loading menu items:', error);
                setError('Failed to load menu items from server. Using default items.');

                const defaultItems: MenuItem[] = [];
                setMenuItems(defaultItems);
            } finally {
                setIsLoading(false);
            }
        };

        if (!adminCheckLoading) {
            loadMenuItems();
        }
    }, [isAdmin, adminCheckLoading]);

    return { menuItems, setMenuItems, isLoading, error };
};
