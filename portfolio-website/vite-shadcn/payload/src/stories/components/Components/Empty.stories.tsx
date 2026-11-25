import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Empty,EmptyHeader,EmptyTitle,EmptyDescription,EmptyContent } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="First use with action"><Empty><EmptyHeader><EmptyTitle>No requests yet</EmptyTitle><EmptyDescription>Create a request to start the approval process.</EmptyDescription></EmptyHeader><EmptyContent><Button>New request</Button></EmptyContent></Empty></Scenario>
<Scenario label="Search has no matches"><Empty><EmptyHeader><EmptyTitle>No customers found</EmptyTitle><EmptyDescription>Try a shorter search term or clear the filters.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline">Clear filters</Button></EmptyContent></Empty></Scenario></>; }
const meta = { id: 'catalog-shadcn-empty', title: 'Components/shadcn/Components/Empty', parameters: { catalog: { component: 'Empty' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Empty"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Empty"><Examples/></CatalogFrame> };
