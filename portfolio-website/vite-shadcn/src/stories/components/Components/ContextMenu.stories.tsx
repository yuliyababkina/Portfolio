import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { ContextMenu,ContextMenuTrigger,ContextMenuContent,ContextMenuItem,ContextMenuSeparator,ContextMenuLabel } from '@/components/ui/context-menu';


function Examples() {
return <><Scenario label="Contextual actions"><ContextMenu><ContextMenuTrigger className="flex h-28 items-center justify-center rounded-md border border-dashed" data-catalog-context="context-menu">Right-click this account</ContextMenuTrigger><ContextMenuContent><ContextMenuLabel data-catalog-result="context-menu">Northwind Ltd</ContextMenuLabel><ContextMenuItem>Edit customer</ContextMenuItem><ContextMenuItem disabled>Archive locked account</ContextMenuItem><ContextMenuSeparator/><ContextMenuItem>View activity</ContextMenuItem></ContextMenuContent></ContextMenu></Scenario>
<Scenario label="Keyboard guidance"><div className="text-sm text-muted-foreground">Open the menu with the context-menu key when the region is focused.</div></Scenario></>; }
const meta = { id: 'catalog-shadcn-contextmenu', title: 'Components/shadcn/Components/ContextMenu', parameters: { catalog: { component: 'ContextMenu' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="ContextMenu"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="ContextMenu"><Examples/></CatalogFrame> };
