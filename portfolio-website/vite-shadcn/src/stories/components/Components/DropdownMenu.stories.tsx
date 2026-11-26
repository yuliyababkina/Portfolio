import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuLabel,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Account actions"><DropdownMenu><DropdownMenuTrigger asChild><Button data-catalog-action="dropdown-menu" variant="outline">Account actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel data-catalog-result="dropdown-menu">Northwind Ltd</DropdownMenuLabel><DropdownMenuItem>Edit customer</DropdownMenuItem><DropdownMenuItem disabled>Archive locked account</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuCheckboxItem checked>Follow updates</DropdownMenuCheckboxItem></DropdownMenuContent></DropdownMenu></Scenario>
<Scenario label="Disabled trigger"><Button disabled>Unavailable menu</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-dropdownmenu', title: 'Components/shadcn/Components/DropdownMenu', parameters: { catalog: { component: 'DropdownMenu' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="DropdownMenu"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="DropdownMenu"><Examples/></CatalogFrame> };
