import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { ButtonGroup,ButtonGroupSeparator,ButtonGroupText } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

function Examples() {
return <><Scenario label="Action group"><ButtonGroup><Button variant="outline">Previous</Button><ButtonGroupSeparator/><Button>Next</Button></ButtonGroup></Scenario>
<Scenario label="Labelled and disabled group"><ButtonGroup><ButtonGroupText>Export</ButtonGroupText><Button variant="outline">CSV</Button><Button variant="outline" disabled>PDF</Button></ButtonGroup></Scenario></>; }
const meta = { id: 'catalog-shadcn-buttongroup', title: 'Components/shadcn/Components/ButtonGroup', parameters: { catalog: { component: 'ButtonGroup' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="ButtonGroup"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="ButtonGroup"><Examples/></CatalogFrame> };
