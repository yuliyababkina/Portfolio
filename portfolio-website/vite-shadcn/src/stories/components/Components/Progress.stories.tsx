import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Progress } from '@/components/ui/progress';


function Examples() {
return <><Scenario label="Progress values"><Progress value={25} aria-label="Document upload"/><Progress value={65} aria-label="Review completion"/><Progress value={100} aria-label="Completed review"/></Scenario>
<Scenario label="Empty progress"><Progress value={0} aria-label="Not started"/></Scenario></>; }
const meta = { id: 'catalog-shadcn-progress', title: 'Components/shadcn/Components/Progress', parameters: { catalog: { component: 'Progress' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Progress"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Progress"><Examples/></CatalogFrame> };
