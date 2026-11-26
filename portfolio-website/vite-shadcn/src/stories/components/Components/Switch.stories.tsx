import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Switch } from '@/components/ui/switch';


function Examples() {
return <><Scenario label="Checked and unchecked"><div className="flex items-center gap-4"><Switch defaultChecked aria-label="Email alerts"/><Switch aria-label="Weekly digest"/></div></Scenario>
<Scenario label="Disabled and invalid"><Switch disabled defaultChecked aria-label="Archived alerts"/><Switch aria-invalid="true" aria-label="Required consent"/></Scenario></>; }
const meta = { id: 'catalog-shadcn-switch', title: 'Components/shadcn/Components/Switch', parameters: { catalog: { component: 'Switch' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Switch"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Switch"><Examples/></CatalogFrame> };
