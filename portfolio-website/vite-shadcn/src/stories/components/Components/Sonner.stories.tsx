import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from '@/theme/ThemeProvider';

function Examples() { const {mode}=useTheme();
return <><Scenario label="Success and error feedback"><Toaster theme={mode}/><Button data-catalog-action="toast" onClick={()=>toast.success(<span data-catalog-result="toast">Draft saved for review</span>,{duration:Infinity})}>Show success notice</Button><Button variant="destructive" onClick={()=>toast.error("Approval requires a reviewer")}>Show error notice</Button></Scenario>
<Scenario label="Information and loading"><Button variant="outline" onClick={()=>toast.info("Review scheduled for Friday")}>Show information</Button><Button variant="outline" onClick={()=>toast.loading("Preparing local preview",{duration:1500})}>Show loading notice</Button></Scenario></>; }
const meta = { id: 'catalog-shadcn-sonner', title: 'Components/shadcn/Components/Sonner', parameters: { catalog: { component: 'Sonner' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Sonner"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Sonner"><Examples/></CatalogFrame> };
