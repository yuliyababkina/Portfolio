import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Table,TableHeader,TableBody,TableFooter,TableRow,TableHead,TableCell,TableCaption } from '@/components/ui/table';


function Examples() {
return <><Scenario label="Invoice records"><Table><TableCaption>Recent customer invoices</TableCaption><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>INV-2048</TableCell><TableCell>Northwind Ltd</TableCell><TableCell className="text-right">$1,250.00</TableCell></TableRow><TableRow data-state="selected"><TableCell>INV-2049</TableCell><TableCell>Contoso</TableCell><TableCell className="text-right">$860.00</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell colSpan={2}>Total</TableCell><TableCell className="text-right">$2,110.00</TableCell></TableRow></TableFooter></Table></Scenario>
<Scenario label="Empty data"><Table><TableHeader><TableRow><TableHead>Customer</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>No matching customers. Clear your filters to continue.</TableCell></TableRow></TableBody></Table></Scenario></>; }
const meta = { id: 'catalog-shadcn-table', title: 'Components/shadcn/Components/Table', parameters: { catalog: { component: 'Table' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Table"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Table"><Examples/></CatalogFrame> };
