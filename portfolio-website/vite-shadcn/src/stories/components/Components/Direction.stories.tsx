import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { DirectionProvider } from '@/components/ui/direction';


function Examples() {
return <><Scenario label="Left to right"><DirectionProvider dir="ltr"><div dir="ltr" className="rounded-md border p-4">Account → Invoice → Approval</div></DirectionProvider></Scenario>
<Scenario label="Right to left"><DirectionProvider dir="rtl"><div dir="rtl" className="rounded-md border p-4">الحساب ← الفاتورة ← الموافقة</div></DirectionProvider></Scenario></>; }
const meta = { id: 'catalog-shadcn-direction', title: 'Components/shadcn/Components/Direction', parameters: { catalog: { component: 'Direction' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Direction"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Direction"><Examples/></CatalogFrame> };
