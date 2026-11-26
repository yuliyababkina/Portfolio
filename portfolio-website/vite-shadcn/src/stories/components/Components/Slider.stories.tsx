import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Slider } from '@/components/ui/slider';


function Examples() {
return <><Scenario label="Single and range"><Slider defaultValue={[35]} max={100} step={5} aria-label="Review completion"/><Slider defaultValue={[20,70]} max={100} step={10} aria-label="Budget range"/></Scenario>
<Scenario label="Disabled and small range"><Slider disabled defaultValue={[40]} aria-label="Locked budget"/><Slider defaultValue={[3]} min={1} max={5} step={1} aria-label="Priority"/></Scenario></>; }
const meta = { id: 'catalog-shadcn-slider', title: 'Components/shadcn/Components/Slider', parameters: { catalog: { component: 'Slider' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Slider"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Slider"><Examples/></CatalogFrame> };
