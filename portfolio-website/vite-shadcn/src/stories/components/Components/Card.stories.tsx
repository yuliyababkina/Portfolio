import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Card,CardHeader,CardTitle,CardDescription,CardContent,CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Account summary"><Card><CardHeader><CardTitle>Northwind Ltd</CardTitle><CardDescription>Enterprise account · Kyiv</CardDescription></CardHeader><CardContent>12 active invoices, 3 awaiting approval.</CardContent><CardFooter><Button>View account</Button></CardFooter></Card></Scenario>
<Scenario label="Compact empty card"><Card><CardHeader><CardTitle>Recent activity</CardTitle></CardHeader><CardContent className="text-muted-foreground">No activity recorded this week.</CardContent></Card></Scenario></>; }
const meta = { id: 'catalog-shadcn-card', title: 'Components/shadcn/Components/Card', parameters: { catalog: { component: 'Card' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Card"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Card"><Examples/></CatalogFrame> };
