import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AchievementResponsetDto } from '~/bundles/achievements/types/types.js';
import { type AsyncThunkConfig } from '~/bundles/common/types/types.js';

import { name as sliceName } from './slice.js';

const getAchievements = createAsyncThunk<
    AchievementResponsetDto[],
    undefined,
    AsyncThunkConfig
>(`${sliceName}/get-achievements`, async (_, { extra }) => {
    const { achievementsApi } = extra;
    return await achievementsApi.getAchievements();
});

export { getAchievements };
