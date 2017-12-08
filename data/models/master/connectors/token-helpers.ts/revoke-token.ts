import { IConnector } from '../';
import { revokTokenInfo } from './revoke-token.info';
import * as request from 'request';
import * as logger from 'winston';

interface ITokenRevokeHeader {
    Authorization?: string;
    Accept?: string;
    'Content-Type'?: string;
}

interface IRevokeTokenBody {
    client_id?: string;
    access_token?: string;
    token?: string;
}

interface IRevokeInfo {
    url: string;
    headers: ITokenRevokeHeader;
    body: IRevokeTokenBody;
}


export function getTokenType(data: IConnector): any {
    let revokeInfo: IRevokeInfo;
    switch (data.type) {
        case 'square':
            revokeInfo.url = revokeToken[data.type].url;
            revokeInfo.headers = revokeToken[data.type].headers;
            revokeInfo.body.client_id = revokeToken[data.type].client_id;
            revokeInfo.body.access_token = data.config.token.access_token;

            return revokeInfo;
        case 'quickbooks-online':
            revokeInfo.url = revokeInfo[data.type].url;
            revokeInfo.headers = revokeToken[data.type].headers;
            revokeInfo.body.token = data.config.token.access_token;

            return revokeInfo;
        default:
            return revokeInfo;
    }
}

export function revokeToken(url: string, headers: ITokenRevokeHeader, body: IRevokeTokenBody) {
    if (!url || !headers) {
        return;
    }

    request({
        url: url,
        method: 'POST',
        headers: headers,
        json: body
    }, (err, response, body) => {
        if (err) {
            logger.error(err);
        }
        logger.debug(body);
    });
}