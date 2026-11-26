import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Popover,PopoverTrigger,PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Examples() {
return <><Scenario label="Editable details"><Popover><PopoverTrigger asChild><Button data-catalog-action="popover" variant="outline">Billing details</Button></PopoverTrigger><PopoverContent><div data-catalog-result="popover" className="space-y-2"><p>Account code NW-2048</p><Input aria-label="Payment terms" defaultValue="Net 30"/></div></PopoverContent></Popover></Scenario>
<Scenario label="Disabled entry"><Button disabled>Archived billing details</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-popover', title: 'Components/shadcn/Components/Popover', parameters: { catalog: { component: 'Popover' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Popover"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Popover"><Examples/></CatalogFrame> };
