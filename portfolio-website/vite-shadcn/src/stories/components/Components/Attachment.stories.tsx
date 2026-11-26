import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Attachment,AttachmentMedia,AttachmentContent,AttachmentTitle,AttachmentDescription,AttachmentGroup } from '@/components/ui/attachment';
import { FileTextIcon } from 'lucide-react';

function Examples() {
return <><Scenario label="Completed and compact files"><AttachmentGroup><Attachment><AttachmentMedia><FileTextIcon/></AttachmentMedia><AttachmentContent><AttachmentTitle>contract.pdf</AttachmentTitle><AttachmentDescription>2.4 MB · Ready</AttachmentDescription></AttachmentContent></Attachment><Attachment size="sm"><AttachmentContent><AttachmentTitle>budget.xlsx</AttachmentTitle><AttachmentDescription>840 KB</AttachmentDescription></AttachmentContent></Attachment></AttachmentGroup></Scenario>
<Scenario label="Progress error and idle"><Attachment state="uploading"><AttachmentContent><AttachmentTitle>review.pdf</AttachmentTitle><AttachmentDescription>Uploading</AttachmentDescription></AttachmentContent></Attachment><Attachment state="error"><AttachmentContent><AttachmentTitle>scan.pdf</AttachmentTitle><AttachmentDescription>Could not upload. Try again.</AttachmentDescription></AttachmentContent></Attachment><Attachment state="idle"><AttachmentContent><AttachmentTitle>Select a document</AttachmentTitle></AttachmentContent></Attachment></Scenario></>; }
const meta = { id: 'catalog-shadcn-attachment', title: 'Components/shadcn/Components/Attachment', parameters: { catalog: { component: 'Attachment' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Attachment"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Attachment"><Examples/></CatalogFrame> };
