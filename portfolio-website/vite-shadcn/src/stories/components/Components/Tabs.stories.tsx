import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Tabs,TabsList,TabsTrigger,TabsContent } from '@/components/ui/tabs';


function Examples() {
return <><Scenario label="Account sections"><Tabs defaultValue="details"><TabsList><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="history">History</TabsTrigger><TabsTrigger value="admin" disabled>Admin</TabsTrigger></TabsList><TabsContent value="details">Northwind Ltd — Active customer</TabsContent><TabsContent value="history">No recent activity.</TabsContent></Tabs></Scenario>
<Scenario label="Alternative default"><Tabs defaultValue="year"><TabsList><TabsTrigger value="month">Month</TabsTrigger><TabsTrigger value="year">Year</TabsTrigger></TabsList><TabsContent value="month">Monthly revenue: $12,500</TabsContent><TabsContent value="year">Annual revenue: $150,000</TabsContent></Tabs></Scenario></>; }
const meta = { id: 'catalog-shadcn-tabs', title: 'Components/shadcn/Components/Tabs', parameters: { catalog: { component: 'Tabs' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Tabs"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Tabs"><Examples/></CatalogFrame> };
