export interface IOAuth2Token {
    access_token: string;
    token_type: string;
    expires_at: string;
    merchant_id?: string;
    refresh_token?: string;
    x_refresh_token_expires_in?: string|number;
}
