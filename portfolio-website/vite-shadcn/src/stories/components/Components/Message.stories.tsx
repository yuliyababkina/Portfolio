import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Message,MessageGroup,MessageAvatar,MessageHeader,MessageContent,MessageFooter } from '@/components/ui/message';


function Examples() {
return <><Scenario label="Incoming message"><MessageGroup><Message><MessageAvatar>MC</MessageAvatar><MessageContent><MessageHeader>Maria Chen</MessageHeader><div className="rounded-md bg-muted p-3">The invoice is ready for review.</div><MessageFooter>10:30 · Delivered</MessageFooter></MessageContent></Message></MessageGroup></Scenario>
<Scenario label="Outgoing message"><Message align="end"><MessageAvatar>AJ</MessageAvatar><MessageContent><MessageHeader>You</MessageHeader><div className="rounded-md bg-primary p-3 text-primary-foreground">I will review this today.</div><MessageFooter>10:32 · Sent</MessageFooter></MessageContent></Message></Scenario></>; }
const meta = { id: 'catalog-shadcn-message', title: 'Components/shadcn/Components/Message', parameters: { catalog: { component: 'Message' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Message"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Message"><Examples/></CatalogFrame> };
