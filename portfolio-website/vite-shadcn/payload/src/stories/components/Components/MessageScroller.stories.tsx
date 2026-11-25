import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { MessageScrollerProvider,MessageScroller,MessageScrollerViewport,MessageScrollerContent,MessageScrollerItem,MessageScrollerButton } from '@/components/ui/message-scroller';


function Examples() {
return <><Scenario label="Scrollable conversation"><div className="h-64"><MessageScrollerProvider><MessageScroller><MessageScrollerViewport><MessageScrollerContent>{Array.from({length:12},(_,index)=><MessageScrollerItem key={index}><div className="rounded-md bg-muted p-3">Review update {index+1}: the account details have been verified.</div></MessageScrollerItem>)}</MessageScrollerContent></MessageScrollerViewport><MessageScrollerButton/></MessageScroller></MessageScrollerProvider></div></Scenario>
<Scenario label="Short conversation"><div className="h-32"><MessageScrollerProvider><MessageScroller><MessageScrollerViewport><MessageScrollerContent><MessageScrollerItem>Welcome to the account review.</MessageScrollerItem></MessageScrollerContent></MessageScrollerViewport></MessageScroller></MessageScrollerProvider></div></Scenario></>; }
const meta = { id: 'catalog-shadcn-messagescroller', title: 'Components/shadcn/Components/MessageScroller', parameters: { catalog: { component: 'MessageScroller' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="MessageScroller"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="MessageScroller"><Examples/></CatalogFrame> };
