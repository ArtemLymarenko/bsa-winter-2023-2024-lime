import { type Meta, type StoryObj } from '@storybook/react';

import { DatePickerStory } from './date-picker-story.js';

const meta: Meta<typeof DatePickerStory> = {
    component: DatePickerStory,
    title: 'Components/Date',
    tags: ['autodocs'],
};

// eslint-disable-next-line import/no-default-export
export default meta;
type Story = StoryObj<typeof DatePickerStory>;

const DateStory: Story = {
    args: {
        label: 'Date',
        placeholder: 'Pick a date',
        className: 'w-80',
    },
};

export { DateStory };
