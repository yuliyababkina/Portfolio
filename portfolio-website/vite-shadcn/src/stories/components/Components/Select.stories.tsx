import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem,SelectGroup,SelectLabel } from '@/components/ui/select';


function Examples() {
return <><Scenario label="Grouped choices"><Select defaultValue="kyiv"><SelectTrigger className="w-64" aria-label="Office" data-catalog-action="select"><SelectValue placeholder="Choose an office"/></SelectTrigger><SelectContent><SelectGroup><SelectLabel data-catalog-result="select">European offices</SelectLabel><SelectItem value="kyiv">Kyiv</SelectItem><SelectItem value="warsaw">Warsaw</SelectItem><SelectItem value="berlin" disabled>Berlin — unavailable</SelectItem></SelectGroup></SelectContent></Select></Scenario>
<Scenario label="Disabled and invalid"><Select disabled><SelectTrigger aria-label="Archived office"><SelectValue placeholder="Archived office"/></SelectTrigger></Select><Select><SelectTrigger aria-invalid="true" aria-label="Required office"><SelectValue placeholder="Office required"/></SelectTrigger></Select></Scenario></>; }
const meta = { id: 'catalog-shadcn-select', title: 'Components/shadcn/Components/Select', parameters: { catalog: { component: 'Select' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Select"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Select"><Examples/></CatalogFrame> };
