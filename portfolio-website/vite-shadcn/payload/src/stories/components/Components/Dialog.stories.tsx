import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Examples() {
return <><Scenario label="Customer dialog"><Dialog><DialogTrigger asChild><Button data-catalog-action="dialog">Edit customer</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit Northwind Ltd</DialogTitle><DialogDescription data-catalog-result="dialog">Update the local customer preview.</DialogDescription></DialogHeader><Input aria-label="Customer name" defaultValue="Northwind Ltd"/><DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><DialogClose asChild><Button>Save changes</Button></DialogClose></DialogFooter></DialogContent></Dialog></Scenario>
<Scenario label="Unavailable action"><Button disabled>Edit archived customer</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-dialog', title: 'Components/shadcn/Components/Dialog', parameters: { catalog: { component: 'Dialog' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Dialog"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Dialog"><Examples/></CatalogFrame> };
