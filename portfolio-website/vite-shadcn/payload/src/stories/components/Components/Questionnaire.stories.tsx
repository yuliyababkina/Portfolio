import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFrame, Scenario } from '../CatalogFrame';
import { Questionnaire,QuestionnaireItem,QuestionnaireTitle,QuestionnaireDescription,QuestionnaireChoices,QuestionnaireChoice,QuestionnaireChoiceDescription,QuestionnaireProgress,QuestionnaireActions,QuestionnairePrevious,QuestionnaireNext,QuestionnaireSubmit } from '@/components/ui/questionnaire';


function Examples() {
return <><Scenario label="Required choice and navigation"><Questionnaire items={[{name:"team",choices:[{value:"design"},{value:"engineering"}],required:true},{name:"confirm",choices:[{value:"yes"}]}]} onSubmit={event=>event.preventDefault()}><QuestionnaireProgress/><QuestionnaireItem name="team" required><QuestionnaireTitle>Which team owns this request?</QuestionnaireTitle><QuestionnaireDescription>Choose a team for the review.</QuestionnaireDescription><QuestionnaireChoices><QuestionnaireChoice value="design">Design<QuestionnaireChoiceDescription>Interface and research work</QuestionnaireChoiceDescription></QuestionnaireChoice><QuestionnaireChoice value="engineering">Engineering</QuestionnaireChoice></QuestionnaireChoices></QuestionnaireItem><QuestionnaireItem name="confirm"><QuestionnaireTitle>Ready to continue?</QuestionnaireTitle><QuestionnaireChoices><QuestionnaireChoice value="yes">Yes, ready for review</QuestionnaireChoice></QuestionnaireChoices></QuestionnaireItem><QuestionnaireActions><QuestionnairePrevious/><QuestionnaireNext/><QuestionnaireSubmit/></QuestionnaireActions></Questionnaire></Scenario>
<Scenario label="Disabled choice"><Questionnaire items={[{name:"locked",choices:[{value:"finance",disabled:true}]}]}><QuestionnaireItem name="locked"><QuestionnaireTitle>Restricted department</QuestionnaireTitle><QuestionnaireChoices><QuestionnaireChoice value="finance" disabled>Finance — administrator access required</QuestionnaireChoice></QuestionnaireChoices></QuestionnaireItem></Questionnaire></Scenario></>; }
const meta = { id: 'catalog-shadcn-questionnaire', title: 'Components/shadcn/Components/Questionnaire', parameters: { catalog: { component: 'Questionnaire' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = { render: () => <CatalogFrame mode="light" name="Questionnaire"><Examples/></CatalogFrame> };
export const Dark: Story = { render: () => <CatalogFrame mode="dark" name="Questionnaire"><Examples/></CatalogFrame> };
