import * as express from 'express';

import { handleOAuth2Itegration } from './oauth2/oauth2-integrations';
import { handleTwitterRequestToken, handleTwitterAccessToken } from './twitter/twitter-integration';

const integration = express.Router();

integration.get('/', handleOAuth2Itegration);

integration.get('/twitter/request-token', handleTwitterRequestToken);

integration.get('/twitter/access-token', handleTwitterAccessToken);

export { integration };