import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Trace,TraceLine,TraceTitle,TraceDescription,TraceIcon,TraceCollapsible,TraceCollapsibleTrigger,TraceCollapsibleContent } from '@/components/ui/trace';
import { Loader2Icon } from 'lucide-react';

function Examples() {
return <><Scenario label="Progress statuses"><Trace><TraceLine status="running"><TraceIcon><Loader2Icon/></TraceIcon><TraceTitle>Reviewing customer details</TraceTitle><TraceDescription>In progress</TraceDescription></TraceLine><TraceLine status="pending"><TraceTitle>Verify billing address</TraceTitle><TraceDescription>Queued</TraceDescription></TraceLine><TraceLine status="error"><TraceTitle>Payment verification</TraceTitle><TraceDescription>Needs attention</TraceDescription></TraceLine></Trace></Scenario>
<Scenario label="Expandable detail"><Trace><TraceCollapsible defaultOpen><TraceCollapsibleTrigger><TraceLine><TraceTitle>Approval complete</TraceTitle></TraceLine></TraceCollapsibleTrigger><TraceCollapsibleContent>Verified by Maria Chen at 10:30.</TraceCollapsibleContent></TraceCollapsible></Trace></Scenario></>; }
const meta = { id: 'catalog-shadcn-trace', title: 'Components/shadcn/Components/Trace', parameters: { catalog: { component: 'Trace' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Trace"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Trace"><Examples/></CatalogFrame> };
