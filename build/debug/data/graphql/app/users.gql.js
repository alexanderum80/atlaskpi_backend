"use strict";
var find_user_by_id_query_1 = require("../../queries/app/users/find-user-by-id.query");
var reset_password_mutation_1 = require("../../mutations/app/users/reset-password.mutation");
var queries_1 = require("../../queries");
var mutations_1 = require("../../mutations");
var users_1 = require("../../../services/notifications/users");
var mutations_2 = require("../../mutations");
exports.usersGql = {
    name: 'users',
    schema: {
        types: "\n            input UserDetails {\n                firstName: String!,\n                middleName: String,\n                lastName: String,\n                email: String!,\n                roles: [String]!\n            }\n            type UserEmail {\n                _id: String\n                address: String\n                verified: Boolean\n            }\n            type UserLoginToken {\n                _id: String\n                when: String\n                hashedToken: String\n                clientId: String\n            }\n            type UserEmailedToken {\n                _id: String\n                token: String\n                email: String\n                when: String\n            }\n            type PasswordReset {\n                _id: String\n                reset: UserEmailedToken\n            }\n            type UserServiceEmail {\n                _id: String\n                verificationTokens: [UserEmailedToken]\n            }\n            type UserServices {\n                _id: String\n                loginTokens: [UserLoginToken]\n                password: PasswordReset\n                email: UserServiceEmail\n            }\n            type UserProfile {\n                _id: String\n                firstName: String\n                middleName: String\n                lastName: String\n                sex: String\n                dob: String\n            }\n            type User {\n                _id: String\n                username: String\n                emails: [UserEmail]\n                services: [UserServices]\n                profile: UserProfile\n                roles: [String]\n            }           \n            type TokenVerification {\n                isValid: Boolean\n            }\n            type ValidationError {\n                field: String\n            }\n            type CreateUserResult {\n                user: User\n                errors: [ErrorDetails]\n            }\n            type ForgotPasswordResult {\n                success: Boolean\n                errors: [ErrorDetails]\n            }\n            type ResetPasswordResult {\n                success: Boolean\n                errors: [ErrorDetails]\n            }\n            type UserPagedQueryResult {\n                pagination: PaginationInfo\n                data: [User]\n            }\n            type UserResult {\n                user: User\n                errors: [ErrorDetails]\n            }\n        ",
        queries: "\n            isResetPasswordTokenValid(token: String!): TokenVerification\n            users(details: PaginationDetails): UserPagedQueryResult\n            User(id: String!): UserResult\n        ",
        mutations: "\n            createUser(data: UserDetails): CreateUserResult\n            updateUser(id: String!, data: UserDetails): CreateUserResult\n            removeUser(id: String!): CreateUserResult\n            userForgotPassword(email: String!): ForgotPasswordResult\n            resetPassword(token: String!, password: String!): ResetPasswordResult\n        "
    },
    resolvers: {
        Query: {
            isResetPasswordTokenValid: function (root, args, ctx) {
                var query = new queries_1.VerifyResetPasswordQuery(ctx.req.identity, ctx.req.appContext.User);
                return ctx.queryBus.run('verify-reset-password', query, args);
            },
            users: function (root, args, ctx) {
                var query = new queries_1.SearchUsersQuery(ctx.req.identity, ctx.req.appContext.User);
                return ctx.queryBus.run('search-users', query, args);
            },
            User: function (root, args, ctx) {
                var query = new find_user_by_id_query_1.FindUserByIdQuery(ctx.req.identity, ctx.req.appContext.User);
                return ctx.queryBus.run('find-user-by-id', query, args);
            }
        },
        Mutation: {
            createUser: function (root, args, ctx) {
                var notifier = new users_1.AccountCreatedNotification(ctx.config);
                var mutation = new mutations_2.CreateUserMutation(ctx.req.identity, notifier, ctx.req.appContext.User);
                return ctx.mutationBus.run('create-user', ctx.req, mutation, args);
            },
            updateUser: function (root, args, ctx) {
                var mutation = new mutations_2.UpdateUserMutation(ctx.req.identity, ctx.req.appContext.User);
                return ctx.mutationBus.run('update-user', ctx.req, mutation, args);
            },
            removeUser: function (root, args, ctx) {
                var mutation = new mutations_2.RemoveUserMutation(ctx.req.identity, ctx.req.appContext.User);
                return ctx.mutationBus.run('remove-user', ctx.req, mutation, args);
            },
            userForgotPassword: function (root, args, ctx) {
                var notifier = new users_1.UserForgotPasswordNotification(ctx.config);
                var mutation = new mutations_1.UserForgotPasswordMutation(ctx.req.identity, notifier, ctx.req.appContext.User);
                return ctx.mutationBus.run('user-forgot-password', ctx.req, mutation, args);
            },
            resetPassword: function (root, args, ctx) {
                var mutation = new reset_password_mutation_1.ResetPasswordMutation(ctx.req.identity, ctx.req.appContext.User);
                return ctx.mutationBus.run('reset-password', ctx.req, mutation, args);
            }
        },
        User: {
            emails: function (user) { return user.emails; },
            services: function (user) { return user.services; },
            profile: function (user) { return user.profile; },
            roles: function (user) { return user.roles.map(function (role) { return role.name; }); }
        },
        UserServices: {
            loginTokens: function (userServices) { return userServices.loginTokens; },
            password: function (userServices) { return userServices.password; },
            email: function (userServices) { return userServices.email; }
        },
        PasswordReset: {
            reset: function (passwordReset) { return passwordReset.reset; }
        },
        UserServiceEmail: {
            verificationTokens: function (userServiceEmail) { return userServiceEmail.verificationTokens; }
        },
        CreateUserResult: {
            user: function (response) { return response.entity; },
            errors: function (response) { return response.errors; }
        },
        ForgotPasswordResult: {
            success: function (response) { return response.success; },
            errors: function (response) { return response.errors; }
        },
        ResetPasswordResult: {
            success: function (response) { return response.success; },
            errors: function (response) { return response.errors; }
        },
        UserPagedQueryResult: {
            pagination: function (response) { return response.pagination; },
            data: function (response) { return response.data; }
        },
        UserResult: {
            user: function (response) { return response.data; },
            errors: function (response) { return response.errors; }
        }
    }
};
//# sourceMappingURL=users.gql.js.map