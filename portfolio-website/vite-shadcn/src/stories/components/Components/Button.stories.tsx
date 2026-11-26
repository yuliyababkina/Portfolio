import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Button } from '@/components/ui/button';
import { PlusIcon, Loader2Icon } from 'lucide-react';

function Examples() {
return <><Scenario label="Variants"><div className="flex flex-wrap gap-2"><Button>Approve request</Button><Button variant="secondary">Save draft</Button><Button variant="outline">Preview</Button><Button variant="ghost">More</Button><Button variant="link">Read policy</Button><Button variant="destructive">Delete</Button></div></Scenario>
<Scenario label="Sizes disabled icon and loading"><div className="flex items-center gap-2"><Button size="sm">Small</Button><Button size="lg">Large</Button><Button disabled>Unavailable</Button><Button size="icon" aria-label="New request"><PlusIcon/></Button><Button disabled><Loader2Icon className="animate-spin"/>Saving</Button></div></Scenario></>; }
const meta = { id: 'catalog-shadcn-button', title: 'Components/shadcn/Components/Button', parameters: { catalog: { component: 'Button' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Button"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Button"><Examples/></CatalogFrame> };
