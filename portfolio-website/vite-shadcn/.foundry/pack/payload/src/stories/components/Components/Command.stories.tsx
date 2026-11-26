import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Command,CommandInput,CommandList,CommandEmpty,CommandGroup,CommandItem,CommandShortcut,CommandSeparator } from '@/components/ui/command';


function Examples() {
return <><Scenario label="Search and grouped actions"><Command className="rounded-md border"><CommandInput placeholder="Search workspace actions"/><CommandList><CommandEmpty>No actions found.</CommandEmpty><CommandGroup heading="Workspace"><CommandItem>New request<CommandShortcut>⌘N</CommandShortcut></CommandItem><CommandItem>Search customers</CommandItem></CommandGroup><CommandSeparator/><CommandGroup heading="Settings"><CommandItem disabled>Admin settings</CommandItem></CommandGroup></CommandList></Command></Scenario>
<Scenario label="Empty search guidance"><div className="text-sm text-muted-foreground">Type an unmatched term above to inspect the empty state.</div></Scenario></>; }
const meta = { id: 'catalog-shadcn-command', title: 'Components/shadcn/Components/Command', parameters: { catalog: { component: 'Command' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Command"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Command"><Examples/></CatalogFrame> };
