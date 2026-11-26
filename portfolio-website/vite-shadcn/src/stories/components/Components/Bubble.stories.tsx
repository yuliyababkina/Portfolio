import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Bubble,BubbleContent,BubbleGroup } from '@/components/ui/bubble';


function Examples() {
return <><Scenario label="Message variants"><BubbleGroup><Bubble><BubbleContent>Your review is ready.</BubbleContent></Bubble><Bubble variant="secondary"><BubbleContent>Draft saved at 10:30.</BubbleContent></Bubble><Bubble variant="outline"><BubbleContent>Awaiting approval.</BubbleContent></Bubble></BubbleGroup></Scenario>
<Scenario label="Alignment and error"><Bubble align="end" variant="muted"><BubbleContent>I will review this today.</BubbleContent></Bubble><Bubble variant="destructive"><BubbleContent>Unable to send this message.</BubbleContent></Bubble></Scenario></>; }
const meta = { id: 'catalog-shadcn-bubble', title: 'Components/shadcn/Components/Bubble', parameters: { catalog: { component: 'Bubble' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Bubble"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Bubble"><Examples/></CatalogFrame> };
