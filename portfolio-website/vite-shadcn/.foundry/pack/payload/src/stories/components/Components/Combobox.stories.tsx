import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty } from '@/components/ui/combobox';


function Examples() {
return <><Scenario label="Searchable office selection"><Combobox items={["Kyiv","Warsaw","Berlin"]}><ComboboxInput placeholder="Select an office" aria-label="Office"/><ComboboxContent><ComboboxEmpty>No offices found.</ComboboxEmpty><ComboboxList>{item=><ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></Scenario>
<Scenario label="Disabled selection"><Combobox items={["Kyiv"]} defaultValue="Kyiv"><ComboboxInput disabled aria-label="Archived office"/></Combobox></Scenario></>; }
const meta = { id: 'catalog-shadcn-combobox', title: 'Components/shadcn/Components/Combobox', parameters: { catalog: { component: 'Combobox' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Combobox"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Combobox"><Examples/></CatalogFrame> };
