import { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { sapODataService } from '../services/sapODataService';

export const useMenuItems = (isAdmin: boolean, adminCheckLoading: boolean) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isAdmin) {
          const nonAdminItems: MenuItem[] = [
            // {
            //   id: 'scaia-default',
            //   name: 'mySCAI',
            //   description: 'Supply Chain AI Assistant',
            //   visible: true,
            //   order: 0,
            //   type: 'Section',
            //   deleted: false,
            //   roles: [],
            //   isNew: false,
            // },
          ];
          setMenuItems(nonAdminItems);
          return;
        }

        const items = await sapODataService.fetchMenuItems();

        if (items.length === 0) {
          const defaultItems: MenuItem[] = [
            // {
            //     id: sapODataService.generateGUID(),
            //     name: 'My SCM',
            //     description: 'Supply Chain Management Dashboard',
            //     visible: true,
            //     order: 0,
            //     type: 'Section',
            //     deleted: false,
            //     roles: [],
            //     isNew: false,
            // },
            // {
            //     id: sapODataService.generateGUID(),
            //     name: 'mySCAI',
            //     description: 'Supply Chain AI Assistant',
            //     visible: true,
            //     order: 1,
            //     type: 'Section',
            //     deleted: false,
            //     roles: [],
            //     isNew: false,
            // },
            // {
            //     id: sapODataService.generateGUID(),
            //     name: 'B2B Reports',
            //     description: 'Manage and view your B2B reporting dashboard',
            //     visible: true,
            //     order: 2,
            //     type: 'Section',
            //     deleted: false,
            //     roles: [],
            //     isNew: false,
            // },
          ];
          setMenuItems(defaultItems);
        } else {
          setMenuItems(items.sort((a, b) => a.order - b.order));
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
        setError('Failed to load menu items from server. Using default items.');

        const defaultItems: MenuItem[] = isAdmin
          ? [
              // {
              //     id: 'default-1',
              //     name: 'My SCM',
              //     description: 'Supply Chain Management Dashboard',
              //     visible: true,
              //     order: 0,
              //     type: 'Section',
              //     deleted: false,
              //     roles: [],
              //     isNew: false,
              // },
              // {
              //     id: 'default-2',
              //     name: 'mySCAI',
              //     description: 'Supply Chain AI Assistant',
              //     visible: true,
              //     order: 1,
              //     type: 'Section',
              //     deleted: false,
              //     roles: [],
              //     isNew: false,
              // },
              // {
              //     id: 'default-3',
              //     name: 'B2B Reports',
              //     description: 'Manage and view your B2B reporting dashboard',
              //     visible: true,
              //     order: 2,
              //     type: 'Section',
              //     deleted: false,
              //     roles: [],
              //     isNew: false,
              // },
            ]
          : [
              // {
              //     id: 'scaia-default',
              //     name: 'mySCAI',
              //     description: 'Supply Chain AI Assistant',
              //     visible: true,
              //     order: 0,
              //     type: 'Section',
              //     deleted: false,
              //     roles: [],
              //     isNew: false,
              // },
            ];
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
