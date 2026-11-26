import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { ScrollArea,ScrollBar } from '@/components/ui/scroll-area';


function Examples() {
return <><Scenario label="Vertical records"><ScrollArea className="h-48 rounded-md border p-4">{Array.from({length:16},(_,i)=><div className="border-b py-2" key={i}>Invoice INV-{2048+i}</div>)}</ScrollArea></Scenario>
<Scenario label="Horizontal content"><ScrollArea className="w-80 rounded-md border"><div className="flex w-max gap-4 p-4">{["Research","Design","Engineering","Finance","Operations"].map(name=><div className="w-36 rounded-md bg-muted p-4" key={name}>{name}</div>)}</div><ScrollBar orientation="horizontal"/></ScrollArea></Scenario></>; }
const meta = { id: 'catalog-shadcn-scrollarea', title: 'Components/shadcn/Components/ScrollArea', parameters: { catalog: { component: 'ScrollArea' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="ScrollArea"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="ScrollArea"><Examples/></CatalogFrame> };
