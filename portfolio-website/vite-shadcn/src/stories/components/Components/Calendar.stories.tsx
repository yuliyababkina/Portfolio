import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Calendar } from '@/components/ui/calendar';

import { useState } from 'react';

function Examples() { const [date,setDate]=useState<Date|undefined>(new Date(2026,10,2));
return <><Scenario label="Selected date"><Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={new Date(2026,10,1)} className="w-fit rounded-md border"/></Scenario>
<Scenario label="Range and disabled dates"><Calendar mode="range" defaultMonth={new Date(2026,10,1)} disabled={{before:new Date(2026,10,2)}} className="w-fit rounded-md border"/></Scenario></>; }
const meta = { id: 'catalog-shadcn-calendar', title: 'Components/shadcn/Components/Calendar', parameters: { catalog: { component: 'Calendar' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Calendar"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Calendar"><Examples/></CatalogFrame> };
