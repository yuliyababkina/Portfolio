import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Skeleton } from '@/components/ui/skeleton';


function Examples() {
return <><Scenario label="Profile loading"><div className="flex items-center gap-4"><Skeleton className="size-12 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div></Scenario>
<Scenario label="Card loading"><div className="space-y-3"><Skeleton className="h-32 w-64"/><Skeleton className="h-4 w-56"/><Skeleton className="h-4 w-40"/></div></Scenario></>; }
const meta = { id: 'catalog-shadcn-skeleton', title: 'Components/shadcn/Components/Skeleton', parameters: { catalog: { component: 'Skeleton' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Skeleton"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Skeleton"><Examples/></CatalogFrame> };
