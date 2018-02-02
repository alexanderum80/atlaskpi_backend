import { isArray } from 'lodash';
import * as request from 'request';

import { config } from '../../../configuration/config';
import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import { ISchedulerRequest } from './../models/ISchedulerRequest';

const pjson = require('../../../../package.json');

// AKPI_CONNECTORS_IDS is the environment variable in all connectors projects
// ex: AKPI_CONNECTORS_IDS: "5a27248f4aa9765acde192a2|5a22425ff8512d203eac32bc"
function runTask(integration: IConnectorDocument, connectorsIds: string | string[]): Promise<any> {
    if (!integration || !connectorsIds) {
        return Promise.reject('could not request scheduler to run a task without a task definition or connectors ids');
    }

    if (!integration.task) {
        return Promise.reject('called runTask method but integration does not contain a task definition. doing nothing...');
    }

    let connectorsStr;
    if (isArray(connectorsIds)) {
        connectorsStr = connectorsIds.map(s => String(s)).join('|');
    } else {
        connectorsStr = String(connectorsIds);
    }

    const taskPayload = {
        ...integration.task
    };

    taskPayload.environment = [
        {
            name: 'AKPI_CONNECTORS_IDS',
            value: connectorsStr
        }
    ];

    const payload: ISchedulerRequest = {
        identifier: pjson.name,
        secret: config.scheduler.secret,
        task: taskPayload
    };

    const url = config.scheduler.server + '/task';

    const requestObj = {
        url: url,
        method: 'POST',
        json: payload,
    };

    return new Promise<any>((resolve, reject) => {
        request(requestObj, (err, res: any) => {
            if (err || res.statusCode !== 200) {
                reject('error starting task for connectors: ' + connectorsStr + ' err: ' + err || res.statusMessage);
                return;
            }

           resolve('requested to start task for connectors: ' + connectorsStr);
        });
    });
}

export { runTask };
