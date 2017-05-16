import * as fs from 'fs';

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
        }
    };
}

function readTemplate(name: string) {
    return fs.readFileSync(__dirname + '/templates/' + name + '.template.hbs', 'utf8');
}

export const usersServiceConfig = {
    app: {
        name: 'Application Name',
        url: 'http://localhost:9090',
    },
    from: 'orlando@kpibi.com',
    usernameField: 'email', // this could be emil or username
    locking: {
        tries: 3,  // tries
        period: 5, // minutes
    },
    services: {
        createUser: {
            emailTemplate: readTemplate('account-created'),
            // https://github.com/zeit/ms
            expiresIn: '7 days'
        },
        verifyEmail: {
            emailTemplate: readTemplate('verify-email'),
            expiresIn: '7 days'
        },
        forgotPassword: {
            emailTemplate: readTemplate('forgot-password'),
            expiresIn: '1d'
        },
        enrollment: {
            emailTemplate: readTemplate('new-enrollment'),
            expiresIn: '7 days'
        }
    }
};
