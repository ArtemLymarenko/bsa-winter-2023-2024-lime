import { type ActivityType } from '../../../enums/enums.js';
import { type ValueOf } from '../../../types/types.js';

type WorkoutResponseDto = {
    id: number;
    activityType: ValueOf<typeof ActivityType>;
    workoutStartedAt: Date;
    workoutEndedAt: Date | null;
    speed: number;
    duration: number;
    distance: number;
    heartRate: number | null;
    steps?: number;
    kilocalories: number;
};

export { type WorkoutResponseDto };
