import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Item,ItemMedia,ItemContent,ItemTitle,ItemDescription,ItemActions,ItemGroup } from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { FileTextIcon } from 'lucide-react';

function Examples() {
return <><Scenario label="Record with actions"><Item variant="outline"><ItemMedia><FileTextIcon/></ItemMedia><ItemContent><ItemTitle>Invoice INV-2048</ItemTitle><ItemDescription>Northwind Ltd · $1,250.00</ItemDescription></ItemContent><ItemActions><Button variant="outline">Review</Button></ItemActions></Item></Scenario>
<Scenario label="Compact record group"><ItemGroup><Item size="sm"><ItemContent><ItemTitle>Draft contract</ItemTitle><ItemDescription>Updated today</ItemDescription></ItemContent></Item><Item size="sm"><ItemContent><ItemTitle>Budget plan</ItemTitle><ItemDescription>Updated yesterday</ItemDescription></ItemContent></Item></ItemGroup></Scenario></>; }
const meta = { id: 'catalog-shadcn-item', title: 'Components/shadcn/Components/Item', parameters: { catalog: { component: 'Item' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Item"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Item"><Examples/></CatalogFrame> };
