import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { InputGroup,InputGroupInput,InputGroupAddon,InputGroupText,InputGroupButton } from '@/components/ui/input-group';


function Examples() {
return <><Scenario label="Prefix and action"><InputGroup><InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon><InputGroupInput placeholder="northwind.example"/><InputGroupAddon align="inline-end"><InputGroupButton>Check</InputGroupButton></InputGroupAddon></InputGroup></Scenario>
<Scenario label="Invalid and disabled"><InputGroup><InputGroupInput aria-invalid="true" placeholder="Invalid website"/></InputGroup><InputGroup><InputGroupInput disabled value="Archived website"/></InputGroup></Scenario></>; }
const meta = { id: 'catalog-shadcn-inputgroup', title: 'Components/shadcn/Components/InputGroup', parameters: { catalog: { component: 'InputGroup' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="InputGroup"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="InputGroup"><Examples/></CatalogFrame> };
