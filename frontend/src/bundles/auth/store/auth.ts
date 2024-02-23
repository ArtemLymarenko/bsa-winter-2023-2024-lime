import { refreshUser, signIn, signUp, updateUser } from './actions.js';
import { actions } from './slice.js';

const allActions = {
    ...actions,
    signUp,
    signIn,
    updateUser,
    refreshUser,
};

export { allActions as actions };
export { reducer } from './slice.js';
