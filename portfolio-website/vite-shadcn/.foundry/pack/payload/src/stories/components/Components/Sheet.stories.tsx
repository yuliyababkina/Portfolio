import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Sheet,SheetTrigger,SheetContent,SheetHeader,SheetTitle,SheetDescription,SheetFooter,SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Side panel"><Sheet><SheetTrigger asChild><Button data-catalog-action="sheet" variant="outline">Review customer</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Northwind Ltd</SheetTitle><SheetDescription data-catalog-result="sheet">Review the customer profile before approval.</SheetDescription></SheetHeader><SheetFooter><SheetClose asChild><Button>Done reviewing</Button></SheetClose></SheetFooter></SheetContent></Sheet></Scenario>
<Scenario label="Unavailable entry"><Button disabled>Review archived customer</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-sheet', title: 'Components/shadcn/Components/Sheet', parameters: { catalog: { component: 'Sheet' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Sheet"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Sheet"><Examples/></CatalogFrame> };
