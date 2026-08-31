'use client';

import { DashboardShell } from '@/features/dashboard';

/**
 * Live route for the clean-architecture reference feature. Runs alongside the
 * existing homepage (`/`) so nothing is disrupted; flip the root route over
 * once feature parity is confirmed.
 */
export default function DashboardNextPage() {
    return <DashboardShell />;
}
