import {
    type UserAuthRequestDto,
    type UserAuthResponseDto,
    type UserService,
} from '~/bundles/users/users.js';
import { cryptService, jwtService } from '~/common/services/services.js';

import {
    BonusAmount,
    UserBonusActionType,
    UserBonusTransactionType,
} from '../user-bonuses/user-bonuses.js';
import { HttpCode, HttpError, UserValidationMessage } from './enums/enums.js';
import { type AuthResponseDto } from './types/types.js';

class AuthService {
    private userService: UserService;

    public constructor(userService: UserService) {
        this.userService = userService;
    }

    private async verifyLoginCredentials(
        userRequestDto: UserAuthRequestDto,
    ): Promise<UserAuthResponseDto> {
        const user = await this.userService.find({
            email: userRequestDto.email,
        });

        if (!user) {
            throw new HttpError({
                message: UserValidationMessage.LOGIN_CREDENTIALS_DO_NOT_MATCH,
                status: HttpCode.BAD_REQUEST,
            });
        }

        const isEqualPassword = cryptService.compareSyncPassword(
            userRequestDto.password,
            user.getPasswordHash(),
        );

        if (!isEqualPassword) {
            throw new HttpError({
                message: UserValidationMessage.LOGIN_CREDENTIALS_DO_NOT_MATCH,
                status: HttpCode.BAD_REQUEST,
            });
        }

        return user.toObject();
    }

    public async signIn(
        userRequestDto: UserAuthRequestDto,
    ): Promise<AuthResponseDto> {
        const user = await this.verifyLoginCredentials(userRequestDto);
        const token = await jwtService.createToken({ userId: user.id });

        return { user, token };
    }

    public async signUp(
        userRequestDto: UserAuthRequestDto,
        referralCode: string,
    ): Promise<AuthResponseDto> {
        const userByEmail = await this.userService.find({
            email: userRequestDto.email,
        });

        if (userByEmail) {
            throw new HttpError({
                message: UserValidationMessage.EMAIL_ALREADY_TAKEN,
                status: HttpCode.BAD_REQUEST,
            });
        }

        const isReferralProvided = referralCode.length > 0;
        const inviterUser = await this.userService.findWithUserDetailsJoined({
            referralCode,
        });

        if (isReferralProvided && !inviterUser) {
            throw new HttpError({
                message: UserValidationMessage.USER_WITH_REFERRAL_ID_NOT_FOUND,
                status: HttpCode.NOT_FOUND,
            });
        }

        const user = await this.userService.create(userRequestDto);
        const token = await jwtService.createToken({ userId: user.id });

        if (isReferralProvided && inviterUser) {
            const { id: inviterId } = inviterUser.toObject();

            await this.userService.createUserBonusTransaction({
                userId: user.id,
                actionType: UserBonusActionType.REGISTERED,
                transactionType: UserBonusTransactionType.INCOME,
                amount: BonusAmount[UserBonusActionType.REGISTERED],
            });

            await this.userService.createUserBonusTransaction({
                userId: inviterId,
                actionType: UserBonusActionType.INVITED,
                transactionType: UserBonusTransactionType.INCOME,
                amount: BonusAmount[UserBonusActionType.INVITED],
            });

            return {
                user: {
                    ...user,
                    bonusBalance: BonusAmount[UserBonusActionType.REGISTERED],
                },
                token,
            };
        }

        return { user, token };
    }
}

export { AuthService };
