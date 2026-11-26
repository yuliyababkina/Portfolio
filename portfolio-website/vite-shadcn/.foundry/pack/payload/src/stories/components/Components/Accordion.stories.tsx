import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Accordion,AccordionItem,AccordionTrigger,AccordionContent } from '@/components/ui/accordion';


function Examples() {
return <><Scenario label="Expandable account information"><Accordion type="single" collapsible defaultValue="billing"><AccordionItem value="billing"><AccordionTrigger>Billing details</AccordionTrigger><AccordionContent>Net 30 payment terms. Invoices are reviewed every Friday.</AccordionContent></AccordionItem><AccordionItem value="security"><AccordionTrigger>Security policy</AccordionTrigger><AccordionContent>Approval requires an assigned reviewer.</AccordionContent></AccordionItem></Accordion></Scenario>
<Scenario label="Multiple and disabled"><Accordion type="multiple" defaultValue={["details"]}><AccordionItem value="details"><AccordionTrigger>Account details</AccordionTrigger><AccordionContent>Northwind Ltd</AccordionContent></AccordionItem><AccordionItem value="archive" disabled><AccordionTrigger>Archived documents</AccordionTrigger><AccordionContent>Unavailable</AccordionContent></AccordionItem></Accordion></Scenario></>; }
const meta = { id: 'catalog-shadcn-accordion', title: 'Components/shadcn/Components/Accordion', parameters: { catalog: { component: 'Accordion' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Accordion"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Accordion"><Examples/></CatalogFrame> };
