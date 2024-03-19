import {
    CalendarDaysIcon as ScheduleIcon,
    PlusIcon,
} from '@heroicons/react/16/solid';
import { type ChartData } from 'chart.js';
import { format, parseISO } from 'date-fns';

import {
    Button,
    ButtonVariant,
    CreateScheduleForm,
    DateCalendar,
    DoughnutChart,
    Loader,
    Modal,
    ScheduleCard,
} from '~/bundles/common/components/components.js';
import { DEFAULT_SCHEDULE_FORM_VALUE } from '~/bundles/common/components/create-schedule-form/constants/constants.js';
import {
    ComponentSize,
    DataStatus,
    Theme,
} from '~/bundles/common/enums/enums.js';
import {
    capitalizeFirstLetter,
    convertMetersToKilometers,
    formatDateToIso,
} from '~/bundles/common/helpers/helpers.js';
import {
    useAppDispatch,
    useAppForm,
    useAppSelector,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from '~/bundles/common/hooks/hooks.js';
import { type CreateScheduleRequest } from '~/bundles/common/types/types.js';
import { FrequencyType } from '~/bundles/goals/enums/enums.js';
import { actions as goalActions } from '~/bundles/goals/store/goals.js';
import { actions as scheduleActions } from '~/bundles/schedules/store/schedules.js';

import {
    DEFAULT_CALENDAR_VALUE,
    DOUGHNUT_DATASET,
    DOUGHNUT_OPTIONS,
} from '../constants/constants.js';
import { isDateInRange } from '../helpers/helpers.js';
import { type ScheduleRequestDto } from '../types/types.js';

const ZERO_VALUE = 0;
const PLURAL = 's';
const DAY_PREPOSITION = 'a';
const WEEK_PREPOSITION = 'per';

const timeFormat = 'dd/MM/yyyy HH:mm';

const Schedule: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);
    const [baseFormValue, setBaseFormValue] = useState<CreateScheduleRequest>(
        DEFAULT_SCHEDULE_FORM_VALUE,
    );
    const dispatch = useAppDispatch();
    const { control, watch } = useAppForm({
        mode: 'onTouched',
        shouldUnregister: false,
        defaultValues: DEFAULT_CALENDAR_VALUE,
    });

    const watchedDate = watch('date');

    const { dataStatus: goalsDataStatus, goals } = useAppSelector(
        ({ goals }) => goals,
    );

    const { theme } = useAppSelector(({ theme }) => theme);

    const { dataStatus: scheduleDataStatus, schedules } = useAppSelector(
        ({ schedules }) => schedules,
    );

    const goalsList = useMemo(() => {
        return goals.map(({ activityType, id, frequency, frequencyType }) => ({
            value: id,
            label: `
                 ${capitalizeFirstLetter(activityType)} ${frequency} time${frequency > 1 ? PLURAL : ''}
                 ${
                     frequencyType === FrequencyType.DAY
                         ? DAY_PREPOSITION
                         : WEEK_PREPOSITION
                 }
                 ${frequencyType}
            `,
        }));
    }, [goals]);

    const filteredSchedules = useMemo(() => {
        const START_TIME = 0;
        const END_TIME = 1;
        const formattedDates = watchedDate.map((item) =>
            formatDateToIso(item, 'yyyy/MM/dd'),
        );

        const range = [...new Set(formattedDates)];

        return schedules.filter((schedule) => {
            const start = range[START_TIME] ?? String(ZERO_VALUE);
            const end = range[END_TIME];

            return isDateInRange(schedule.startAt as string, start, end);
        });
    }, [watchedDate, schedules]);

    const randomGoal = useMemo(() => {
        const schedulesWithGoal = filteredSchedules.filter(
            (schedule) => schedule.goalId,
        );
        const randomIndex = Math.floor(
            Math.random() * schedulesWithGoal.length,
        );
        const schedule = schedulesWithGoal[randomIndex];
        return goals.find((goal) => goal.id === schedule?.goalId);
    }, [filteredSchedules]);

    const doughnutData = useMemo((): ChartData<'doughnut'> | null => {
        if (!randomGoal) {
            return null;
        }
        const TOTAL_PERCENTAGE = 100;
        return {
            datasets: [
                {
                    data: [
                        TOTAL_PERCENTAGE - randomGoal.progress,
                        randomGoal.progress,
                    ],
                    ...DOUGHNUT_DATASET,
                    backgroundColor: [
                        theme === Theme.DARK
                            ? 'rgb(28, 34, 39)'
                            : 'rgb(121 131 146)',
                        'rgb(224 254 16)',
                    ],
                },
            ],
        };
    }, [randomGoal, theme]);

    const handleModalStatus = useCallback(() => {
        if (isUpdateMode) {
            setIsUpdateMode(false);
        }
        if (isModalOpen) {
            setBaseFormValue(DEFAULT_SCHEDULE_FORM_VALUE);
        }
        setIsModalOpen((previousState) => !previousState);
    }, [isModalOpen]);

    const onUpdate = useCallback(
        (id: number) => {
            const schedule = schedules.find((schedule) => schedule.id === id);
            if (schedule) {
                const date = parseISO(schedule.startAt as string);
                setBaseFormValue({
                    activity: schedule.activityType,
                    goalLabel: schedule.goalId ?? null,
                    dateOfStart: format(date, timeFormat),
                    id,
                });
                handleModalStatus();
                setIsUpdateMode(true);
            }
        },
        [dispatch, schedules, handleModalStatus],
    );

    const onDelete = useCallback(
        (id: number) => {
            void dispatch(scheduleActions.deleteSchedule({ id: String(id) }));
        },
        [dispatch, handleModalStatus, schedules, isUpdateMode],
    );

    const scheduleHandler = useCallback(
        ({ activity, goalLabel, dateOfStart, id }: CreateScheduleRequest) => {
            const convertedDate = formatDateToIso(dateOfStart, timeFormat);

            const preparedData: ScheduleRequestDto = {
                activityType: activity,
                goalId: (goalLabel as number) || null,
                startAt: convertedDate,
            };

            isUpdateMode && id
                ? void dispatch(
                      scheduleActions.updateSchedule({
                          id: String(id),
                          payload: preparedData,
                      }),
                  )
                : void dispatch(scheduleActions.createSchedule(preparedData));

            handleModalStatus();
        },
        [dispatch, handleModalStatus, schedules, isUpdateMode],
    );

    useEffect(() => {
        if (scheduleDataStatus !== DataStatus.FULFILLED) {
            void dispatch(scheduleActions.getSchedules());
        }
        if (goalsDataStatus !== DataStatus.FULFILLED) {
            void dispatch(goalActions.getGoals());
        }
    }, [dispatch]);

    const isLoading = [scheduleDataStatus, goalsDataStatus].includes(
        DataStatus.PENDING,
    );

    return (
        <>
            <section className="relative flex h-full w-full flex-col gap-[1.2rem] lg:flex-row">
                {isLoading ? (
                    <Loader isOverflow />
                ) : (
                    <>
                        <div>
                            <div className="bg-secondary flex h-full flex-col gap-[1.75rem]">
                                <h1 className="text-card text-xl font-bold">
                                    My Schedule
                                </h1>
                                <DateCalendar
                                    name="date"
                                    control={control}
                                    range={true}
                                    minDate={new Date()}
                                />
                            </div>
                        </div>
                        <div className="bg-primary my-[-2rem] hidden h-[calc(100%+4rem)] w-1 lg:block"></div>
                        <div className="w-full max-w-none lg:max-w-[23.5rem] xl:max-w-none">
                            {filteredSchedules.length > 0 ? (
                                <div className="mb-3 flex flex-col gap-[1.2rem] xl:flex-row">
                                    <ul className="flex w-full flex-col gap-[0.7rem] lg:max-w-[25rem]">
                                        {filteredSchedules.map(
                                            ({ activityType, id, startAt }) => {
                                                const date = new Date(startAt);
                                                const weekDay = format(
                                                    date,
                                                    'EEEE',
                                                );
                                                const hours = format(
                                                    date,
                                                    'HH',
                                                );
                                                const minutes = format(
                                                    date,
                                                    'mm',
                                                );

                                                return (
                                                    <ScheduleCard
                                                        weekDay={weekDay ?? ''}
                                                        activityType={
                                                            activityType
                                                        }
                                                        id={id}
                                                        isExpanded={true}
                                                        date={`${hours}:${minutes}`}
                                                        key={id}
                                                        onUpdate={onUpdate}
                                                        onDelete={onDelete}
                                                    />
                                                );
                                            },
                                        )}
                                        <div className="bg-primary w-full">
                                            <Button
                                                type="button"
                                                label="Set new shcedule"
                                                variant={
                                                    ButtonVariant.SECONDARY
                                                }
                                                size={ComponentSize.LARGE}
                                                leftIcon={
                                                    <PlusIcon className="w-6" />
                                                }
                                                className="h-[6.75rem] sm:text-sm md:text-xl"
                                                onClick={handleModalStatus}
                                            />
                                        </div>
                                    </ul>
                                    {randomGoal ? (
                                        <div className="bg-scheduleWidget bg-primary text-card flex h-full max-h-[20rem] w-full flex-col items-center gap-[1.2rem] rounded-lg p-7 font-bold lg:max-w-[23.75rem]">
                                            <div>
                                                {capitalizeFirstLetter(
                                                    randomGoal.activityType,
                                                )}
                                            </div>
                                            <div>
                                                <span>
                                                    {randomGoal.frequency} time
                                                    {randomGoal.frequency > 1 &&
                                                        PLURAL}{' '}
                                                </span>
                                                :
                                                <span>
                                                    {randomGoal.distance
                                                        ? `${convertMetersToKilometers(randomGoal.distance)} km`
                                                        : `${randomGoal.duration} min`}
                                                </span>
                                                /
                                                <span>
                                                    {randomGoal.frequencyType}
                                                </span>
                                            </div>
                                            {doughnutData && (
                                                <div className="relative">
                                                    <DoughnutChart
                                                        className="h-[2.7rem] w-[11rem]"
                                                        data={doughnutData}
                                                        options={
                                                            DOUGHNUT_OPTIONS
                                                        }
                                                    />
                                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                                                        {randomGoal.progress} %
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="font-base text-primary mb-[1.75rem] flex items-center text-xl">
                                    <p className="mr-3">
                                        At this date, you don&#39;t have any
                                        schedules yet
                                    </p>
                                    <ScheduleIcon className="h-6 w-6" />
                                </div>
                            )}
                            {filteredSchedules.length === 0 ? (
                                <div className="bg-primary w-full md:w-full xl:w-[48.8%]">
                                    <Button
                                        type="button"
                                        label="Set the new shcedule"
                                        variant={ButtonVariant.SECONDARY}
                                        size={ComponentSize.LARGE}
                                        leftIcon={<PlusIcon className="w-6" />}
                                        className="h-[6.75rem] sm:text-sm md:text-xl"
                                        onClick={handleModalStatus}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </>
                )}
            </section>
            <Modal
                isOpen={isModalOpen}
                title={
                    isUpdateMode ? 'Update schedule' : 'Set the new schedule'
                }
                onClose={handleModalStatus}
            >
                <CreateScheduleForm
                    onSubmit={scheduleHandler}
                    isLoading={isLoading}
                    value={baseFormValue}
                    goalsList={
                        goalsList.length > ZERO_VALUE
                            ? [...goalsList, { value: '', label: 'None' }]
                            : goalsList
                    }
                />
            </Modal>
        </>
    );
};

export { Schedule };
