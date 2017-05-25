export interface IUserToken {
    issued: Date;
    expires: Date;
    access_token: string;
}