import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Toggle } from '@/components/ui/toggle';


function Examples() {
return <><Scenario label="Pressed and unpressed"><Toggle defaultPressed aria-label="Bold text">B</Toggle><Toggle aria-label="Italic text">I</Toggle></Scenario>
<Scenario label="Sizes outline and disabled"><Toggle size="sm" variant="outline">Small</Toggle><Toggle size="lg" variant="outline">Large</Toggle><Toggle disabled>Locked</Toggle></Scenario></>; }
const meta = { id: 'catalog-shadcn-toggle', title: 'Components/shadcn/Components/Toggle', parameters: { catalog: { component: 'Toggle' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Toggle"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Toggle"><Examples/></CatalogFrame> };
