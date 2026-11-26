import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function Examples() {
return <><Scenario label="Labelled input"><div className="space-y-2"><Label htmlFor="label-company">Company name</Label><Input id="label-company" placeholder="Northwind Ltd"/></div></Scenario>
<Scenario label="Disabled field label"><div className="space-y-2"><Label htmlFor="label-archive">Archived account</Label><Input id="label-archive" disabled value="NW-2048"/></div></Scenario></>; }
const meta = { id: 'catalog-shadcn-label', title: 'Components/shadcn/Components/Label', parameters: { catalog: { component: 'Label' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Label"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Label"><Examples/></CatalogFrame> };
