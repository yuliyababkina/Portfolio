import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { ToggleGroup,ToggleGroupItem } from '@/components/ui/toggle-group';


function Examples() {
return <><Scenario label="Single selection"><ToggleGroup type="single" defaultValue="table"><ToggleGroupItem value="table">Table</ToggleGroupItem><ToggleGroupItem value="board">Board</ToggleGroupItem><ToggleGroupItem value="timeline" disabled>Timeline</ToggleGroupItem></ToggleGroup></Scenario>
<Scenario label="Multiple selection"><ToggleGroup type="multiple" defaultValue={["design"]} variant="outline"><ToggleGroupItem value="design">Design</ToggleGroupItem><ToggleGroupItem value="finance">Finance</ToggleGroupItem><ToggleGroupItem value="engineering">Engineering</ToggleGroupItem></ToggleGroup></Scenario></>; }
const meta = { id: 'catalog-shadcn-togglegroup', title: 'Components/shadcn/Components/ToggleGroup', parameters: { catalog: { component: 'ToggleGroup' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="ToggleGroup"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="ToggleGroup"><Examples/></CatalogFrame> };
