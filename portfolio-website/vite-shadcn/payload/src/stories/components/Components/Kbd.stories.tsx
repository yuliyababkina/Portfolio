import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Kbd,KbdGroup } from '@/components/ui/kbd';


function Examples() {
return <><Scenario label="Keyboard shortcut"><KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup><span>Open command menu</span></Scenario>
<Scenario label="Navigation keys"><KbdGroup><Kbd>Shift</Kbd><Kbd>Tab</Kbd></KbdGroup><span>Move to previous field</span></Scenario></>; }
const meta = { id: 'catalog-shadcn-kbd', title: 'Components/shadcn/Components/Kbd', parameters: { catalog: { component: 'Kbd' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Kbd"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Kbd"><Examples/></CatalogFrame> };
