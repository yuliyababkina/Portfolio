import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { ResizablePanelGroup,ResizablePanel,ResizableHandle } from '@/components/ui/resizable';


function Examples() {
return <><Scenario label="Horizontal split"><ResizablePanelGroup orientation="horizontal" className="min-h-40 rounded-md border"><ResizablePanel defaultSize="30%"><div className="p-4">Customer directory</div></ResizablePanel><ResizableHandle withHandle/><ResizablePanel><div className="p-4">Northwind account details</div></ResizablePanel></ResizablePanelGroup></Scenario>
<Scenario label="Vertical split"><ResizablePanelGroup orientation="vertical" className="h-48 rounded-md border"><ResizablePanel><div className="p-3">Document preview</div></ResizablePanel><ResizableHandle/><ResizablePanel><div className="p-3">Review activity</div></ResizablePanel></ResizablePanelGroup></Scenario></>; }
const meta = { id: 'catalog-shadcn-resizable', title: 'Components/shadcn/Components/Resizable', parameters: { catalog: { component: 'Resizable' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Resizable"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Resizable"><Examples/></CatalogFrame> };
