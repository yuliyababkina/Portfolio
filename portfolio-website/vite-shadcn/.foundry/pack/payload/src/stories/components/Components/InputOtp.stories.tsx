import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { InputOTP,InputOTPGroup,InputOTPSlot,InputOTPSeparator } from '@/components/ui/input-otp';


function Examples() {
return <><Scenario label="Six digit verification"><InputOTP maxLength={6} aria-label="Verification code"><InputOTPGroup><InputOTPSlot index={0}/><InputOTPSlot index={1}/><InputOTPSlot index={2}/></InputOTPGroup><InputOTPSeparator/><InputOTPGroup><InputOTPSlot index={3}/><InputOTPSlot index={4}/><InputOTPSlot index={5}/></InputOTPGroup></InputOTP></Scenario>
<Scenario label="Disabled"><InputOTP maxLength={4} disabled value="2048" aria-label="Archived verification code"><InputOTPGroup>{[0,1,2,3].map(index=><InputOTPSlot key={index} index={index}/>)}</InputOTPGroup></InputOTP></Scenario></>; }
const meta = { id: 'catalog-shadcn-inputotp', title: 'Components/shadcn/Components/InputOtp', parameters: { catalog: { component: 'InputOtp' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="InputOtp"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="InputOtp"><Examples/></CatalogFrame> };
