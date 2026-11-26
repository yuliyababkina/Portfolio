import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Badge } from '@/components/ui/badge';
import { CheckIcon } from 'lucide-react';

function Examples() {
return <><Scenario label="Semantic variants"><Badge>Active</Badge><Badge variant="secondary">Draft</Badge><Badge variant="outline">In review</Badge><Badge variant="destructive">Rejected</Badge></Scenario>
<Scenario label="With icon"><Badge><CheckIcon className="size-3"/>Approved</Badge></Scenario></>; }
const meta = { id: 'catalog-shadcn-badge', title: 'Components/shadcn/Components/Badge', parameters: { catalog: { component: 'Badge' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Badge"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Badge"><Examples/></CatalogFrame> };
