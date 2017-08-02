
export interface IEmailServiceConfig {
    from: string;
    provider: string;
    mailgun: {
        auth: {
            api_key: string;
            domain: string;
        }
    };
}

export const emailServiceConfig: IEmailServiceConfig = {
    from: 'orlando@kpibi.com',
    provider: 'mailgun',
    mailgun: {
        auth: {
            api_key: 'key-0fc884951c756671de992c1ed2fcaf60',
            domain: 'kpibi.com'
        }
    }
};
