import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { HoverCard,HoverCardTrigger,HoverCardContent } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Person details"><HoverCard><HoverCardTrigger asChild><Button variant="link" data-catalog-hover="hover-card">Maria Chen</Button></HoverCardTrigger><HoverCardContent><div data-catalog-result="hover-card">Finance reviewer · Kyiv office</div></HoverCardContent></HoverCard></Scenario>
<Scenario label="Link context"><div className="text-sm text-muted-foreground">Hover or focus the reviewer name to see their role and office.</div></Scenario></>; }
const meta = { id: 'catalog-shadcn-hovercard', title: 'Components/shadcn/Components/HoverCard', parameters: { catalog: { component: 'HoverCard' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="HoverCard"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="HoverCard"><Examples/></CatalogFrame> };
