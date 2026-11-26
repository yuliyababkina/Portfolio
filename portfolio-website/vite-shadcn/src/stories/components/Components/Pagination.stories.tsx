import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Pagination,PaginationContent,PaginationItem,PaginationLink,PaginationPrevious,PaginationNext,PaginationEllipsis } from '@/components/ui/pagination';


function Examples() {
return <><Scenario label="Active page and overflow"><Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#previous"/></PaginationItem><PaginationItem><PaginationLink href="#page1">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink isActive href="#page2">2</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis/></PaginationItem><PaginationItem><PaginationNext href="#next"/></PaginationItem></PaginationContent></Pagination></Scenario>
<Scenario label="Single page"><Pagination><PaginationContent><PaginationItem><PaginationLink isActive href="#page1">1</PaginationLink></PaginationItem></PaginationContent></Pagination></Scenario></>; }
const meta = { id: 'catalog-shadcn-pagination', title: 'Components/shadcn/Components/Pagination', parameters: { catalog: { component: 'Pagination' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Pagination"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Pagination"><Examples/></CatalogFrame> };
