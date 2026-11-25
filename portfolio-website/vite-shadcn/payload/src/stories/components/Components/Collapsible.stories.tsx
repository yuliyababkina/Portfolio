import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Collapsible,CollapsibleTrigger,CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Expanded details"><Collapsible defaultOpen><CollapsibleTrigger asChild><Button variant="outline">Toggle billing details</Button></CollapsibleTrigger><CollapsibleContent>Account code NW-2048. Net 30 payment terms.</CollapsibleContent></Collapsible></Scenario>
<Scenario label="Disabled collapsed"><Collapsible disabled><CollapsibleTrigger asChild><Button disabled>Archived details</Button></CollapsibleTrigger><CollapsibleContent>Unavailable</CollapsibleContent></Collapsible></Scenario></>; }
const meta = { id: 'catalog-shadcn-collapsible', title: 'Components/shadcn/Components/Collapsible', parameters: { catalog: { component: 'Collapsible' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Collapsible"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Collapsible"><Examples/></CatalogFrame> };
