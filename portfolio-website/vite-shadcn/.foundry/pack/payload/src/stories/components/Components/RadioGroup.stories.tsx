import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { RadioGroup,RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

function Examples() {
return <><Scenario label="Selected and unselected"><RadioGroup defaultValue="weekly" aria-label="Digest frequency"><div className="flex items-center gap-2"><RadioGroupItem value="daily" id="daily"/><Label htmlFor="daily">Daily</Label></div><div className="flex items-center gap-2"><RadioGroupItem value="weekly" id="weekly"/><Label htmlFor="weekly">Weekly</Label></div></RadioGroup></Scenario>
<Scenario label="Disabled and invalid"><RadioGroup aria-label="Unavailable options" disabled><RadioGroupItem value="never" aria-label="Never"/></RadioGroup><RadioGroup aria-invalid="true" aria-label="Required selection"><RadioGroupItem value="review" aria-label="Review"/></RadioGroup></Scenario></>; }
const meta = { id: 'catalog-shadcn-radiogroup', title: 'Components/shadcn/Components/RadioGroup', parameters: { catalog: { component: 'RadioGroup' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="RadioGroup"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="RadioGroup"><Examples/></CatalogFrame> };
