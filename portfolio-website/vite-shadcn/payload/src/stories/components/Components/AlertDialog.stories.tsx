import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { AlertDialog,AlertDialogTrigger,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Destructive confirmation"><AlertDialog><AlertDialogTrigger asChild><Button data-catalog-action="alert-dialog" variant="destructive">Delete draft</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this draft?</AlertDialogTitle><AlertDialogDescription data-catalog-result="alert-dialog">Invoice INV-2048 will be removed from this mock view.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep draft</AlertDialogCancel><AlertDialogAction>Delete draft</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></Scenario>
<Scenario label="Unavailable action"><Button disabled variant="destructive">Delete archived request</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-alertdialog', title: 'Components/shadcn/Components/AlertDialog', parameters: { catalog: { component: 'AlertDialog' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="AlertDialog"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="AlertDialog"><Examples/></CatalogFrame> };
