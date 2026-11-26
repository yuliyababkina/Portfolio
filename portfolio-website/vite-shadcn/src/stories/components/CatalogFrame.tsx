import type { ReactNode } from 'react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/shared/ui/typography';

export function CatalogFrame({mode,name,children}:{mode:'light'|'dark';name:string;children:ReactNode}) {
  return <ThemeProvider forcedMode={mode}><div data-testid="catalog-example" data-catalog-component={name}
    data-catalog-mode={mode} className="min-h-96 max-w-6xl space-y-6 bg-background p-6 text-foreground">
    <Heading level={1}>{name} — {mode}</Heading>{children}
  </div></ThemeProvider>;
}
export function Scenario({label,children}:{label:string;children:ReactNode}) {
  return <Card data-catalog-state={label}><CardHeader><CardTitle>{label}</CardTitle></CardHeader>
    <CardContent className="space-y-4">{children}</CardContent></Card>;
}
