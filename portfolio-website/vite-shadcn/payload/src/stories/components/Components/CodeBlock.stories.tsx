import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { CodeBlock,CodeBlockHeader,CodeBlockTitle,CodeBlockContent,CodeBlockLine,CodeBlockFooter } from '@/components/ui/code-block';


function Examples() {
return <><Scenario label="Numbered source"><CodeBlock><CodeBlockHeader><CodeBlockTitle>approval.ts</CodeBlockTitle></CodeBlockHeader><CodeBlockContent lineNumbers>{"const request = { id: 2048 };\nconst status = \"in review\";"}</CodeBlockContent><CodeBlockFooter>TypeScript · Mock example</CodeBlockFooter></CodeBlock></Scenario>
<Scenario label="Diff and error"><CodeBlock variant="destructive" size="sm"><CodeBlockContent><CodeBlockLine variant="removed">status: draft</CodeBlockLine><CodeBlockLine variant="added">status: approved</CodeBlockLine></CodeBlockContent></CodeBlock></Scenario></>; }
const meta = { id: 'catalog-shadcn-codeblock', title: 'Components/shadcn/Components/CodeBlock', parameters: { catalog: { component: 'CodeBlock' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="CodeBlock"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="CodeBlock"><Examples/></CatalogFrame> };
