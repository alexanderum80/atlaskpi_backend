import { readTemplate } from '../configuration-utils';

export interface IUsersServiceConfig {
    app: {
        name: string;
        url: string;
    };
    from: string;
    usernameField: string; // this could be emil or username
    locking: {
        tries: number;  // tries
        period: number; // minutes
    };
    services: {
        leadReceived: {
            emailTemplate: string;
        },
        createUser: {
            emailTemplate: string;
            expiresIn: number | string; // a week
        },
        verifyEmail: {
            emailTemplate: string;
            expiresIn: number | string; // two days
        },
        forgotPassword: {
            emailTemplate: string;
            expiresIn: number | string; // two days
        },
        enrollment: {
            emailTemplate: string;
            expiresIn: number | string; // a week
        },
        targetNotification: {
            emailTemplate: string;
            expiresIn: number | string;
        },
        userMilestone: {
            emailTemplate: string;
            expiresIn: number | string;
        }
    };
}

export const usersServiceConfig = {
    app: {
        name: 'Application Name',
        url: 'http://localhost:4200',
    },
    from: 'noreply@atlaskpi.com',
    usernameField: 'email', // this could be emil or username
    locking: {
        tries: 3,  // tries
        period: 5, // minutes
    },
    services: {
        leadReceived: {
            emailTemplate: readTemplate('users', 'lead-received')
        },
        createUser: {
            emailTemplate: readTemplate('users', 'account-created'),
            // https://github.com/zeit/ms
            expiresIn: '7 days'
        },
        verifyEmail: {
            emailTemplate: readTemplate('users', 'verify-email'),
            expiresIn: '7 days'
        },
        forgotPassword: {
            emailTemplate: readTemplate('users', 'forgot-password'),
            expiresIn: '1d'
        },
        enrollment: {
            emailTemplate: readTemplate('users', 'new-enrollment'),
            expiresIn: '7 days'
        },
        targetNotification: {
            emailTemplate: readTemplate('users', 'target-notification'),
            expiresIn: '7 days'
        },
        userMilestone: {
            emailTemplate: readTemplate('users', 'user-milestone'),
            expiresIn: '7 days'
        }
    }
};
