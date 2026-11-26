import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Carousel,CarouselContent,CarouselItem,CarouselPrevious,CarouselNext } from '@/components/ui/carousel';


function Examples() {
return <><Scenario label="Paged content"><Carousel className="mx-12 w-64"><CarouselContent>{["Research findings","Design review","Delivery plan"].map(title=><CarouselItem key={title}><div className="flex h-32 items-center justify-center rounded-md border bg-muted">{title}</div></CarouselItem>)}</CarouselContent><CarouselPrevious/><CarouselNext/></Carousel></Scenario>
<Scenario label="Multiple items"><Carousel className="w-96"><CarouselContent>{["Invoice 2048","Invoice 2049","Invoice 2050"].map(title=><CarouselItem className="basis-1/2" key={title}><div className="rounded-md border p-4">{title}</div></CarouselItem>)}</CarouselContent></Carousel></Scenario></>; }
const meta = { id: 'catalog-shadcn-carousel', title: 'Components/shadcn/Components/Carousel', parameters: { catalog: { component: 'Carousel' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Carousel"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Carousel"><Examples/></CatalogFrame> };
