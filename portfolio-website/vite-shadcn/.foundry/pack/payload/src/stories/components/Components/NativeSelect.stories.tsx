import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { NativeSelect,NativeSelectOption,NativeSelectOptGroup } from '@/components/ui/native-select';


function Examples() {
return <><Scenario label="Grouped native choices"><NativeSelect aria-label="Office"><NativeSelectOption value="">Choose an office</NativeSelectOption><NativeSelectOptGroup label="Europe"><NativeSelectOption value="kyiv">Kyiv</NativeSelectOption><NativeSelectOption value="warsaw">Warsaw</NativeSelectOption></NativeSelectOptGroup></NativeSelect></Scenario>
<Scenario label="Disabled and invalid"><NativeSelect disabled aria-label="Archived office"><NativeSelectOption>Kyiv</NativeSelectOption></NativeSelect><NativeSelect aria-invalid="true" aria-label="Required office"><NativeSelectOption>Choose an office</NativeSelectOption></NativeSelect></Scenario></>; }
const meta = { id: 'catalog-shadcn-nativeselect', title: 'Components/shadcn/Components/NativeSelect', parameters: { catalog: { component: 'NativeSelect' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="NativeSelect"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="NativeSelect"><Examples/></CatalogFrame> };
