import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Breadcrumb,BreadcrumbList,BreadcrumbItem,BreadcrumbLink,BreadcrumbSeparator,BreadcrumbPage,BreadcrumbEllipsis } from '@/components/ui/breadcrumb';


function Examples() {
return <><Scenario label="Navigation hierarchy"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#workspace">Workspace</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbLink href="#customers">Customers</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbPage>Northwind Ltd</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></Scenario>
<Scenario label="Collapsed levels"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbEllipsis/></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbPage>Invoice INV-2048</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></Scenario></>; }
const meta = { id: 'catalog-shadcn-breadcrumb', title: 'Components/shadcn/Components/Breadcrumb', parameters: { catalog: { component: 'Breadcrumb' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Breadcrumb"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Breadcrumb"><Examples/></CatalogFrame> };
