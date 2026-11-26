import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Drawer,DrawerTrigger,DrawerContent,DrawerHeader,DrawerTitle,DrawerDescription,DrawerFooter,DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Bottom drawer"><Drawer><DrawerTrigger asChild><Button data-catalog-action="drawer">Review invoice</Button></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Invoice INV-2048</DrawerTitle><DrawerDescription data-catalog-result="drawer">$1,250.00 · Due November 30</DrawerDescription></DrawerHeader><DrawerFooter><DrawerClose asChild><Button>Complete review</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer></Scenario>
<Scenario label="Disabled entry"><Button disabled>Review locked invoice</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-drawer', title: 'Components/shadcn/Components/Drawer', parameters: { catalog: { component: 'Drawer' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Drawer"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Drawer"><Examples/></CatalogFrame> };
