import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Field,FieldLabel,FieldDescription,FieldError,FieldGroup,FieldSet,FieldLegend } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

function Examples() {
return <><Scenario label="Label description and input"><FieldSet><FieldLegend>Customer details</FieldLegend><FieldGroup><Field><FieldLabel htmlFor="customer-name">Company name</FieldLabel><Input id="customer-name" defaultValue="Northwind Ltd"/><FieldDescription>Use the legal company name.</FieldDescription></Field></FieldGroup></FieldSet></Scenario>
<Scenario label="Invalid and disabled"><Field data-invalid><FieldLabel htmlFor="billing-email">Billing email</FieldLabel><Input id="billing-email" aria-invalid="true" defaultValue="finance@"/><FieldError>Enter a valid company email address.</FieldError></Field><Field><FieldLabel htmlFor="account-code">Account code</FieldLabel><Input id="account-code" disabled value="NW-2048"/></Field></Scenario></>; }
const meta = { id: 'catalog-shadcn-field', title: 'Components/shadcn/Components/Field', parameters: { catalog: { component: 'Field' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Field"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Field"><Examples/></CatalogFrame> };
