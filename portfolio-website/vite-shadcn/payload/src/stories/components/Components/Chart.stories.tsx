import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { ChartContainer,ChartTooltip,ChartTooltipContent,ChartLegend,ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

function Examples() {
return <><Scenario label="Monthly invoices"><ChartContainer className="h-60 w-full" config={{amount:{label:"Invoices",color:"var(--primary)"}}}><BarChart accessibilityLayer data={[{month:"September",amount:18},{month:"October",amount:24},{month:"November",amount:32}]}><CartesianGrid vertical={false}/><XAxis dataKey="month"/><ChartTooltip content={<ChartTooltipContent/>}/><ChartLegend content={<ChartLegendContent/>}/><Bar dataKey="amount" fill="var(--color-amount)" radius={4}/></BarChart></ChartContainer></Scenario>
<Scenario label="Empty data"><div className="rounded-md border border-dashed p-6 text-muted-foreground">No invoice metrics for this period. Change the reporting range.</div></Scenario></>; }
const meta = { id: 'catalog-shadcn-chart', title: 'Components/shadcn/Components/Chart', parameters: { catalog: { component: 'Chart' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Chart"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Chart"><Examples/></CatalogFrame> };
