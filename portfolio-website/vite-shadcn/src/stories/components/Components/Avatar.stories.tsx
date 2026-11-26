import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Avatar,AvatarFallback,AvatarImage } from '@/components/ui/avatar';


function Examples() {
return <><Scenario label="Initials and image"><Avatar><AvatarFallback>AJ</AvatarFallback></Avatar><Avatar><AvatarImage src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Ctext x=%228%22 y=%2226%22%3EMC%3C/text%3E%3C/svg%3E" alt="Maria Chen"/><AvatarFallback>MC</AvatarFallback></Avatar></Scenario>
<Scenario label="Different sizes"><Avatar className="size-8"><AvatarFallback>NW</AvatarFallback></Avatar><Avatar className="size-16"><AvatarFallback>DB</AvatarFallback></Avatar></Scenario></>; }
const meta = { id: 'catalog-shadcn-avatar', title: 'Components/shadcn/Components/Avatar', parameters: { catalog: { component: 'Avatar' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Avatar"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Avatar"><Examples/></CatalogFrame> };
