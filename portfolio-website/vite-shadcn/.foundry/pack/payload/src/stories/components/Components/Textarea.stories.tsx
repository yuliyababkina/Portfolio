import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Textarea } from '@/components/ui/textarea';


function Examples() {
return <><Scenario label="Review notes"><Textarea placeholder="Add notes for the review team"/><Textarea defaultValue="Please verify the billing address before approval."/></Scenario>
<Scenario label="Disabled and invalid"><Textarea disabled value="Archived review notes"/><Textarea aria-invalid="true" placeholder="A review note is required"/></Scenario></>; }
const meta = { id: 'catalog-shadcn-textarea', title: 'Components/shadcn/Components/Textarea', parameters: { catalog: { component: 'Textarea' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Textarea"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Textarea"><Examples/></CatalogFrame> };
