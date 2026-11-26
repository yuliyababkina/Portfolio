import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Tooltip,TooltipProvider,TooltipTrigger,TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Action hint"><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" data-catalog-hover="tooltip">Approval permissions</Button></TooltipTrigger><TooltipContent><span data-catalog-result="tooltip">Requires an account administrator</span></TooltipContent></Tooltip></TooltipProvider></Scenario>
<Scenario label="Placement"><TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Export report</Button></TooltipTrigger><TooltipContent side="right">Download a local mock report</TooltipContent></Tooltip></TooltipProvider></Scenario></>; }
const meta = { id: 'catalog-shadcn-tooltip', title: 'Components/shadcn/Components/Tooltip', parameters: { catalog: { component: 'Tooltip' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Tooltip"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Tooltip"><Examples/></CatalogFrame> };
