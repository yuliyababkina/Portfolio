import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Separator } from '@/components/ui/separator';


function Examples() {
return <><Scenario label="Horizontal sections"><div>Customer details</div><Separator/><div>Billing information</div></Scenario>
<Scenario label="Vertical separators"><div className="flex h-6 items-center gap-4"><span>Overview</span><Separator orientation="vertical"/><span>Activity</span><Separator orientation="vertical"/><span>Documents</span></div></Scenario></>; }
const meta = { id: 'catalog-shadcn-separator', title: 'Components/shadcn/Components/Separator', parameters: { catalog: { component: 'Separator' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Separator"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Separator"><Examples/></CatalogFrame> };
