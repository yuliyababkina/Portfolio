import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Alert,AlertTitle,AlertDescription } from '@/components/ui/alert';


function Examples() {
return <><Scenario label="Informational message"><Alert><AlertTitle>Review scheduled</AlertTitle><AlertDescription>Your account review is due Friday at 10:00.</AlertDescription></Alert></Scenario>
<Scenario label="Error state"><Alert variant="destructive"><AlertTitle>Payment declined</AlertTitle><AlertDescription>Check the billing details before trying again.</AlertDescription></Alert></Scenario></>; }
const meta = { id: 'catalog-shadcn-alert', title: 'Components/shadcn/Components/Alert', parameters: { catalog: { component: 'Alert' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Alert"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Alert"><Examples/></CatalogFrame> };
