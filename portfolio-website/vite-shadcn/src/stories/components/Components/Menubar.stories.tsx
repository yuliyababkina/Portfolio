import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Menubar,MenubarMenu,MenubarTrigger,MenubarContent,MenubarItem,MenubarSeparator,MenubarShortcut } from '@/components/ui/menubar';


function Examples() {
return <><Scenario label="Application menus"><Menubar><MenubarMenu><MenubarTrigger data-catalog-action="menubar">File</MenubarTrigger><MenubarContent><MenubarItem data-catalog-result="menubar">New request<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem><MenubarSeparator/><MenubarItem disabled>Publish</MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>Edit</MenubarTrigger><MenubarContent><MenubarItem>Undo</MenubarItem></MenubarContent></MenubarMenu></Menubar></Scenario>
<Scenario label="Disabled option"><div className="text-sm text-muted-foreground">Publish is disabled while the request is incomplete.</div></Scenario></>; }
const meta = { id: 'catalog-shadcn-menubar', title: 'Components/shadcn/Components/Menubar', parameters: { catalog: { component: 'Menubar' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Menubar"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Menubar"><Examples/></CatalogFrame> };
