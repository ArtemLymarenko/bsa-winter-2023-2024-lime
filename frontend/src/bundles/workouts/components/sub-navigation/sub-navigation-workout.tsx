import { type WorkoutResponseDto } from 'shared';

import { useState } from '~/bundles/common/hooks/hooks.js';

import { SubNavigationFilter } from './components/sub-navigation-filter.js';
import { SubNavigationWorkoutsList } from './components/sub-navigation-list.js';

type SubNavigationProperties = {
    items: WorkoutResponseDto[];
    title?: string;
    className?: string;
};

const SubNavigationWorkout = ({
    items,
    title,
}: SubNavigationProperties): JSX.Element => {
    const [localItems, setItems] = useState(items);
    const sortedItems = localItems.sort((a, b) => {
        return b.workoutStartedAt.getTime() - a.workoutStartedAt.getTime();
    });

    return (
        <div
            className={
                'bg-primary mb-4 flex w-full flex-row gap-[1.75rem] p-4 sm:h-3/6 sm:flex-col sm:gap-1 md:h-full md:w-[20rem] md:p-[2rem] lg:w-[25rem]  '
            }
        >
            {title && (
                <h1 className="text-primary text-xl font-bold">{title}</h1>
            )}
            <SubNavigationFilter items={sortedItems} setItems={setItems} />
            <SubNavigationWorkoutsList items={sortedItems} />
        </div>
    );
};

export { SubNavigationWorkout };
