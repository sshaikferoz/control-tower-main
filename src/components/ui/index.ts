/**
 * Shared design-system primitives. Import UI primitives from here
 * (`@/components/ui`) so features compose from one place.
 *
 * Convention: Tailwind-first custom primitives (Button, Input, Card) for simple
 * elements; thin MUI wrappers (AppDialog, ...) where MUI's behaviour is worth it.
 */
export { Button } from './Button';
export { Input } from './Input';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { AppDialog } from './Dialog';
