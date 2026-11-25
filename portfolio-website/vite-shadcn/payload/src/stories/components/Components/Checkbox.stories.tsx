import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Checkbox } from '@/components/ui/checkbox';


function Examples() {
return <><Scenario label="Checked unchecked and disabled"><div className="flex items-center gap-4"><Checkbox aria-label="Email alerts" defaultChecked/><Checkbox aria-label="Weekly summary"/><Checkbox aria-label="Archived option" disabled/><Checkbox aria-label="Partially selected" checked="indeterminate"/></div></Scenario>
<Scenario label="Invalid state"><Checkbox aria-label="Accept review policy" aria-invalid="true"/></Scenario></>; }
const meta = { id: 'catalog-shadcn-checkbox', title: 'Components/shadcn/Components/Checkbox', parameters: { catalog: { component: 'Checkbox' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Checkbox"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Checkbox"><Examples/></CatalogFrame> };
