import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { SidebarProvider,Sidebar,SidebarHeader,SidebarContent,SidebarGroup,SidebarGroupLabel,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarFooter,SidebarTrigger,SidebarInset } from '@/components/ui/sidebar';

import { LayoutDashboardIcon, UsersIcon, SettingsIcon } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';

function Examples() {
return <><Scenario label="Workspace navigation"><TooltipProvider><div className="relative h-96 overflow-hidden rounded-md border transform-gpu"><SidebarProvider className="min-h-80"><Sidebar collapsible="icon"><SidebarHeader>LeverX workspace</SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel>Workspace</SidebarGroupLabel><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive><LayoutDashboardIcon/><span>Overview</span></SidebarMenuButton></SidebarMenuItem><SidebarMenuItem><SidebarMenuButton><UsersIcon/><span>Customer directory</span></SidebarMenuButton></SidebarMenuItem><SidebarMenuItem><SidebarMenuButton disabled><SettingsIcon/><span>Administration</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup></SidebarContent><SidebarFooter>Northwind team</SidebarFooter></Sidebar><SidebarInset><div className="p-4"><SidebarTrigger/>Account workspace</div></SidebarInset></SidebarProvider></div></TooltipProvider></Scenario>
<Scenario label="Collapsed state"><TooltipProvider><div className="relative h-96 overflow-hidden rounded-md border transform-gpu"><SidebarProvider defaultOpen={false} className="min-h-40"><Sidebar collapsible="icon"><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="Overview"><LayoutDashboardIcon data-catalog-visual="collapsed navigation icon"/><span>Overview</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar><SidebarInset><SidebarTrigger/>Compact workspace</SidebarInset></SidebarProvider></div></TooltipProvider></Scenario></>; }
const meta = { id: 'catalog-shadcn-sidebar', title: 'Components/shadcn/Components/Sidebar', parameters: { catalog: { component: 'Sidebar' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Sidebar"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Sidebar"><Examples/></CatalogFrame> };
