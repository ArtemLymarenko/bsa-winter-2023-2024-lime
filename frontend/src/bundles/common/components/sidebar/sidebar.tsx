import { CalendarDaysIcon as ScheduleIcon } from '@heroicons/react/16/solid';
import {
    ArrowLeftStartOnRectangleIcon as LogoutIcon,
    QuestionMarkCircleIcon as HelpIcon,
    Squares2X2Icon as OverviewIcon,
} from '@heroicons/react/24/outline';

import { actions as authActions } from '~/bundles/auth/store/auth.js';
import { IconName } from '~/bundles/common/components/icon/enums/enums.js';
import { addSizePropertyHeroIcons } from '~/bundles/common/components/icon/helpers/add-size-hero-icons.js';
import { AppRoute, ComponentSize } from '~/bundles/common/enums/enums.js';
import { getValidClassNames } from '~/bundles/common/helpers/helpers.js';
import {
    useAppDispatch,
    useCallback,
    useEffect,
    useLocation,
    useState,
} from '~/bundles/common/hooks/hooks.js';

import { Button, ButtonVariant, Icon } from '../components.js';
import { SidebarNav } from './components/sidebar-nav/sidebar-nav.js';

type Properties = {
    isOpen?: boolean;
};

const styles = {
    baseStyle:
        'bg-lm-black-100 flex min-h-90 lg:w-72 w-64 flex-col content-center items-center p-7 text-white',
    animationStyle: 'transition-transform duration-[0.5s] ease-[ease-in-out]',
};

const Sidebar = ({ isOpen = true }: Properties): JSX.Element => {
    const { pathname } = useLocation();

    const [activeRoute, setActiveRoute] = useState(pathname);

    const [sidebarStyle, setSidebarStyle] = useState({});

    const dispatch = useAppDispatch();

    const handleLogout = useCallback((): void => {
        void dispatch(authActions.logout());
    }, [dispatch]);

    useEffect(() => {
        setActiveRoute(pathname);
    }, [pathname]);

    useEffect(() => {
        isOpen
            ? setSidebarStyle({ transform: 'translateX(0)', gridArea: 'aside' })
            : setSidebarStyle({ transform: 'translateX(-100%)' });
    }, [isOpen]);

    return (
        <div
            className={getValidClassNames(
                styles.baseStyle,
                styles.animationStyle,
            )}
            style={sidebarStyle}
        >
            <div className="inner h-3/4 w-full border-gray-700 ">
                <div className="flex flex-col gap-4">
                    <SidebarNav
                        icon={<OverviewIcon />}
                        text="Overview"
                        to={AppRoute.OVERVIEW}
                        isActive={activeRoute === AppRoute.OVERVIEW}
                    />
                    <SidebarNav
                        icon={<Icon name={IconName.workoutIcon} />}
                        text="Workout"
                        to={AppRoute.WORKOUT}
                        isActive={activeRoute.includes(AppRoute.WORKOUT)}
                    />
                    <SidebarNav
                        icon={<Icon name={IconName.goalsIcon} />}
                        text="Goals"
                        to={AppRoute.GOALS}
                        isActive={activeRoute === AppRoute.GOALS}
                    />
                    <SidebarNav
                        icon={<ScheduleIcon />}
                        text="My schedule"
                        to={AppRoute.SCHEDULE}
                        isActive={activeRoute === AppRoute.SCHEDULE}
                    />
                </div>
            </div>

            <div className="flex h-1/4 w-full">
                <div className="flex w-full flex-col justify-end gap-3">
                    <SidebarNav
                        icon={<HelpIcon />}
                        text="Help"
                        to={AppRoute.HELP}
                        isActive={activeRoute === AppRoute.HELP}
                    />

                    <div className="flex items-center justify-center">
                        <Button
                            type="button"
                            label={'Logout'}
                            leftIcon={addSizePropertyHeroIcons({
                                icon: <LogoutIcon />,
                                size: ComponentSize.MEDIUM,
                            })}
                            variant={ButtonVariant.SIDEBAR}
                            size={ComponentSize.MEDIUM}
                            onClick={handleLogout}
                        />
                    </div>

                    <div className="flex w-[10rem] items-center justify-center px-6 py-4">
                        <Icon name={IconName.poweredByStravaIcon} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export { Sidebar };
