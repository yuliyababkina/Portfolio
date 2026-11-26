import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Default and sized"><div className="flex items-center gap-4"><Spinner/><Spinner className="size-8"/><Spinner className="size-12"/></div></Scenario>
<Scenario label="Loading action"><Button disabled><Spinner/>Saving request</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-spinner', title: 'Components/shadcn/Components/Spinner', parameters: { catalog: { component: 'Spinner' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Spinner"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Spinner"><Examples/></CatalogFrame> };
