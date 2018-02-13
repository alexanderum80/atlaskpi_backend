import * as express from 'express';

import { handleOAuth2Itegration } from './oauth2/oauth2-integrations';
import { handleTwitterRequestToken, handleTwitterAccessToekn } from './twitter/twitter-integration';

const integration = express.Router();

integration.get('/', handleOAuth2Itegration);

integration.get('/twitter/:company_name/request-token', handleTwitterRequestToken);

integration.get('/twitter/:company_name/access-token', handleTwitterAccessToekn);

export { integration };