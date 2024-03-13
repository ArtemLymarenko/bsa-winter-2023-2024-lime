import { BellIcon } from '@heroicons/react/24/solid';

import { getValidClassNames } from '~/bundles/common/helpers/helpers.js';

type Properties = {
    count: number;
    onClick: () => void;
    showList: boolean;
};

const NotificationBell = ({
    count,
    onClick,
    showList,
}: Properties): JSX.Element => {
    const animate = count > 0 && !showList;

    return (
        <button
            className={getValidClassNames(
                'relative flex items-center justify-center',
                animate && showList === false ? 'animate-pulse' : '',
            )}
            onClick={onClick}
        >
            <BellIcon
                className={getValidClassNames(
                    'text-lm-grey-200 w-8 transform transition-all duration-300 ease-in-out sm:w-6',
                    showList === true ? 'rotate-12 scale-110' : '',
                )}
            />
            {count > 0 && (
                <span
                    className={getValidClassNames(
                        'bg-lm-yellow-100 absolute -right-1 -top-2 flex h-full max-h-4 w-full max-w-4 items-center justify-center rounded-full text-xs font-extrabold transition-all ',
                        showList === true
                            ? 'bg-lm-yellow-200 -right-0 -top-2'
                            : '',
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
};

export { NotificationBell };
