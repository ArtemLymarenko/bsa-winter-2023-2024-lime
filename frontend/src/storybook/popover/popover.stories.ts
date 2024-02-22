import { type Meta, type StoryObj } from '@storybook/react';

import { Popover } from '~/bundles/common/components/popover/popover.js';

const meta: Meta<typeof Popover> = {
    component: Popover,
    title: 'Components/Popover',
    tags: ['autodocs'],
};

// eslint-disable-next-line import/no-default-export
export default meta;
type Story = StoryObj<typeof Popover>;

const PopoverStory: Story = {
    args: {
        classNameContentWrapper: 'w-80 bg-lm-magenta p-5',
        children: 'Click me',
        content: 'Hello World',
        className: 'bg-lm-yellow-100 w-80 p-3',
    },
};

export { PopoverStory };
