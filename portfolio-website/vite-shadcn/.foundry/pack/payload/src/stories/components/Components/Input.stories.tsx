import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Input } from '@/components/ui/input';


function Examples() {
return <><Scenario label="Default sizes and placeholders"><Input placeholder="Search customers"/><Input defaultValue="Northwind Ltd"/><Input type="password" placeholder="Password"/></Scenario>
<Scenario label="Disabled and invalid"><Input disabled value="Archived customer"/><Input aria-invalid="true" placeholder="Company name is required"/></Scenario></>; }
const meta = { id: 'catalog-shadcn-input', title: 'Components/shadcn/Components/Input', parameters: { catalog: { component: 'Input' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Input"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Input"><Examples/></CatalogFrame> };
