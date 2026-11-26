import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { AspectRatio } from '@/components/ui/aspect-ratio';


function Examples() {
return <><Scenario label="Widescreen preview"><div className="w-80"><AspectRatio ratio={16/9}><div className="flex size-full items-center justify-center rounded-md bg-muted text-muted-foreground">16:9 document preview</div></AspectRatio></div></Scenario>
<Scenario label="Square preview"><div className="w-48"><AspectRatio ratio={1}><div className="flex size-full items-center justify-center rounded-md bg-secondary text-secondary-foreground">1:1 profile image</div></AspectRatio></div></Scenario></>; }
const meta = { id: 'catalog-shadcn-aspectratio', title: 'Components/shadcn/Components/AspectRatio', parameters: { catalog: { component: 'AspectRatio' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="AspectRatio"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="AspectRatio"><Examples/></CatalogFrame> };
