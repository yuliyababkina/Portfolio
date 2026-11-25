import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Marker,MarkerContent,MarkerIcon } from '@/components/ui/marker';
import { CheckIcon } from 'lucide-react';

function Examples() {
return <><Scenario label="Divider and section marker"><Marker variant="separator"><MarkerContent>Today</MarkerContent></Marker><Marker variant="border"><MarkerContent>Earlier activity</MarkerContent></Marker></Scenario>
<Scenario label="With icon"><Marker><MarkerIcon><CheckIcon/></MarkerIcon><MarkerContent>All changes saved</MarkerContent></Marker></Scenario></>; }
const meta = { id: 'catalog-shadcn-marker', title: 'Components/shadcn/Components/Marker', parameters: { catalog: { component: 'Marker' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Marker"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Marker"><Examples/></CatalogFrame> };
