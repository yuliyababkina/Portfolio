import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { NavigationMenu,NavigationMenuList,NavigationMenuItem,NavigationMenuTrigger,NavigationMenuContent,NavigationMenuLink } from '@/components/ui/navigation-menu';


function Examples() {
return <><Scenario label="Expandable navigation"><NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger data-catalog-action="navigation-menu">Workspace</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="#customers" data-catalog-result="navigation-menu">Customer directory</NavigationMenuLink><NavigationMenuLink href="#requests">Requests</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu></Scenario>
<Scenario label="Direct link"><NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuLink href="#reports">Reports overview</NavigationMenuLink></NavigationMenuItem></NavigationMenuList></NavigationMenu></Scenario></>; }
const meta = { id: 'catalog-shadcn-navigationmenu', title: 'Components/shadcn/Components/NavigationMenu', parameters: { catalog: { component: 'NavigationMenu' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="NavigationMenu"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="NavigationMenu"><Examples/></CatalogFrame> };
