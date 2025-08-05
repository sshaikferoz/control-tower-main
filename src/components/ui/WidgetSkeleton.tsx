import React from 'react';
import { Skeleton } from '@mui/material';

interface WidgetSkeletonProps {
  height?: number;
}

export const WidgetSkeleton: React.FC<WidgetSkeletonProps> = ({ height = 200 }) => (
  <div className="flex h-full w-full flex-col p-4">
    <Skeleton
      variant="text"
      width="60%"
      height={24}
      sx={{
        bgcolor: '#0164B0',
        flexShrink: 0,
      }}
    />
    <div className="mt-2 flex-1">
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{ bgcolor: '#0164B0', borderRadius: '25px' }}
      />
    </div>
  </div>
);
