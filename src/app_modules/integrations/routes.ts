import * as express from 'express';

import { handleOAuth2Itegration } from './oauth2/oauth2-integrations';
import { handleTwitterIntegration } from './twitter/twitter-integration';

const integration = express.Router();

integration.get('/integration', handleOAuth2Itegration);

integration.get('/integration/twitter/:company_name/request-token', handleTwitterIntegration);

integration.get('/integration/twitter/:company_name/access-token', handleTwitterIntegration);

export { integration };