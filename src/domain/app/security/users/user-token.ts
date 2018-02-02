export interface IUserToken {
    issued: Date;
    expires: Date;
    access_token: string;

    // company info
    subdomain?: string;
    companyName?: string;
    email?: string;
    fullName?: string;
}