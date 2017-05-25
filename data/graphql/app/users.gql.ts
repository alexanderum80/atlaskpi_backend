import { _getHostname } from '../../../middlewares/initialize-contexts.middleware';
import { IQueryResponse } from '../../models/common/query-response';
import { FindUserByIdQuery } from '../../queries/app/users/find-user-by-id.query';
import { ResetPasswordMutation } from '../../mutations/app/users/reset-password.mutation';
import { VerifyResetPasswordQuery, SearchUsersQuery, VerifyEnrollmentQuery } from '../../queries';
import { IMutationResponse, IPagedQueryResult } from '../../models/common';
import { UserForgotPasswordMutation } from '../../mutations';
import { AccountCreatedNotification, UserForgotPasswordNotification } from '../../../services/notifications/users';
import { IUserDocument, IUserServices } from '../../models/app/users';
import { IGraphqlContext } from '../graphql-context';
import { GraphqlDefinition } from '../graphql-definition';
import { ExtendedRequest } from '../../../middlewares';
import * as logger from 'winston';
import * as nodemailer from 'nodemailer';

import { IUser } from '../../models';
import { CreateUserMutation, UpdateUserMutation, RemoveUserMutation } from '../../mutations';

export const usersGql: GraphqlDefinition = {
    name: 'users',
    schema: {
        types: `
            input UserDetails {
                firstName: String,
                middleName: String,
                lastName: String,
                email: String!,
                roles: [String]!
            }
            type UserEmail {
                _id: String
                address: String
                verified: Boolean
            }
            type UserLoginToken {
                _id: String
                when: String
                hashedToken: String
                clientId: String
            }
            type UserEmailedToken {
                _id: String
                token: String
                email: String
                when: String
            }
            type PasswordReset {
                _id: String
                reset: UserEmailedToken
            }
            type UserServiceEmail {
                _id: String
                verificationTokens: [UserEmailedToken]
            }
            type UserServices {
                _id: String
                loginTokens: [UserLoginToken]
                password: PasswordReset
                email: UserServiceEmail
            }
            type UserProfile {
                _id: String
                firstName: String
                middleName: String
                lastName: String
                sex: String
                dob: String
            }
            type User {
                _id: String
                username: String
                emails: [UserEmail]
                profile: UserProfile
                roles: [String]
            }           
            type TokenVerification {
                isValid: Boolean
            }
            type ValidationError {
                field: String
            }
            type CreateUserResult {
                user: User
                errors: [ErrorDetails]
            }
            type ForgotPasswordResult {
                success: Boolean
                errors: [ErrorDetails]
            }
            type ResetPasswordResult {
                success: Boolean
                errors: [ErrorDetails]
            }
            type UserPagedQueryResult {
                pagination: PaginationInfo
                data: [User]
            }
            type UserResult {
                user: User
                errors: [ErrorDetails]
            }
        `,
        queries: `
            isResetPasswordTokenValid(token: String!): TokenVerification
            users(details: PaginationDetails): UserPagedQueryResult
            User(id: String): User
            isEnrollmentTokenValid(token: String!): TokenVerification
        `,
        mutations: `
            createUser(data: UserDetails): CreateUserResult
            updateUser(id: String!, data: UserDetails): CreateUserResult
            removeUser(id: String!): CreateUserResult
            userForgotPassword(email: String!): ForgotPasswordResult
            resetPassword(token: String!, password: String!, enrollment: Boolean): ResetPasswordResult
        `,
    },

    resolvers: {
        Query: {
            isResetPasswordTokenValid(root: any, args, ctx: IGraphqlContext) {
                let query = new VerifyResetPasswordQuery(ctx.req.identity, ctx.req.appContext.User);
                return ctx.queryBus.run('verify-reset-password', query, args);
            },
            users(root: any, args, ctx: IGraphqlContext) {
                let query = new SearchUsersQuery(ctx.req.identity, ctx.req.appContext.User);
                return ctx.queryBus.run('search-users', query, args);
            },
            User(root: any, args, ctx: IGraphqlContext) {
                if (!ctx.req.identity || !ctx.req.appContext.User) { return null; }
                let query = new FindUserByIdQuery(ctx.req.identity, ctx.req.appContext.User);
                return ctx.queryBus.run('find-user-by-id', query, args);
            },
            isEnrollmentTokenValid(root: any, args, ctx: IGraphqlContext) {
                let query = new VerifyEnrollmentQuery(ctx.req.identity, ctx.req.appContext.User);
                return ctx.queryBus.run('verify-enrollment', query, args);
            },
        },
        Mutation: {
            createUser(root: any, args, ctx: IGraphqlContext) {
                let notifier = new AccountCreatedNotification(ctx.config);
                let mutation = new CreateUserMutation(ctx.req.identity, notifier, ctx.req.appContext.User);
                return ctx.mutationBus.run<IMutationResponse>('create-user', ctx.req, mutation, args);
            },
            updateUser(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateUserMutation(ctx.req.identity, ctx.req.appContext.User);
                return ctx.mutationBus.run<IMutationResponse>('update-user', ctx.req, mutation, args);
            },
            removeUser(root: any, args, ctx: IGraphqlContext) {
                let mutation = new RemoveUserMutation(ctx.req.identity, ctx.req.appContext.User);
                return ctx.mutationBus.run<IMutationResponse>('remove-user', ctx.req, mutation, args);
            },
            userForgotPassword(root: any, args, ctx: IGraphqlContext) {
                let notifier = new UserForgotPasswordNotification(ctx.config, { hostname: _getHostname(ctx.req) });
                let mutation = new UserForgotPasswordMutation(ctx.req.identity, notifier, ctx.req.appContext.User);
                return ctx.mutationBus.run<IMutationResponse>('user-forgot-password', ctx.req, mutation, args);
            },
            resetPassword(root: any, args, ctx: IGraphqlContext) {
                let mutation = new ResetPasswordMutation(ctx.req.identity, ctx.req.appContext.User);
                return ctx.mutationBus.run<IMutationResponse>('reset-password', ctx.req, mutation, args);
            }
        },
        User: {
            emails(user: IUserDocument) { return user.emails; },
            // services(user: IUserDocument) { return user.services; },
            profile(user: IUserDocument) { return user.profile; },
            roles(user: IUserDocument) { return user.roles.map((role) => role.name ); }
        },
        UserServices: {
            loginTokens(userServices: IUserServices) { return userServices.loginTokens; },
            password(userServices: IUserServices) { return userServices.password; },
            email(userServices: IUserServices) { return userServices.email; }
        },
        PasswordReset: {
            reset(passwordReset) { return passwordReset.reset; }
        },
        UserServiceEmail: {
            verificationTokens(userServiceEmail) { return userServiceEmail.verificationTokens; }
        },
        CreateUserResult: {
            user(response: IMutationResponse) { return response.entity; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        ForgotPasswordResult: {
            success(response: IMutationResponse) { return response.success; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        ResetPasswordResult: {
            success(response: IMutationResponse) { return response.success; },
            errors(response: IMutationResponse) { return response.errors; }
        },
        UserPagedQueryResult: {
            pagination(response: IPagedQueryResult<IUser>) { return response.pagination; },
            data(response: IPagedQueryResult<IUser>) { return response.data; }
        },
        UserResult: {
            user(response: IQueryResponse<IUserDocument>) { return response.data; },
            errors(response: IQueryResponse<IUserDocument>) { return response.errors; }
        }
    }
};