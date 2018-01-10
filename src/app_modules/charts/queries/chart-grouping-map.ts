import * as _ from 'lodash';
import { each } from 'lodash';

import { IChart } from '../../../domain/app/charts/chart';

export const GroupingMap = {
    sales: {
        location: 'location.name',
        employee: 'employee.fullName',
        provider: 'employee.fullName',
        category: 'category.name',
        product: 'product.itemDescription',
        serviceType: 'serviceType',
        businessUnit: 'businessUnit.name',
        customerState: 'customer.state',
        customerCity: 'customer.city',
        customerZip: 'customer.zip',
        customerGender: 'customer.gender'
    },
    expenses: {
        businessUnit: 'businessUnit.name',
        concept: 'expense.concept',
        location: 'location.name'
    },
    inventory: {
        location: 'location.name',
        product: 'product.itemDescription',
    },
    googleanalytics: {
        connector: 'connector.connectorId',
        website: 'websiteUrl',
        browser: 'browser',
        city: 'city',
        country: 'country',
        deviceCategory: 'deviceCategory',
        language: 'language',
        operatingSystem: 'operatingSystem'
    }
};

export function getGroupingMetadata(chartDocument: IChart, groupings: string[]) {
    if ((!chartDocument || !chartDocument.groupings) && !groupings) {
        return null;
    }

    if (!chartDocument) chartDocument = <any>{};

    let result: string[] = [];
    let groups: string[] = [];

    groups = groups.concat(chartDocument.groupings, groupings);

    let uniqGrouping = [];
    each(GroupingMap, collection => {
        Object.keys(collection).forEach(key => {
            uniqGrouping[key] = collection[key];
        });
    });

    groups.forEach(g => {
            let group = uniqGrouping[g];

            if (group && result.indexOf(g) === -1) {
                result.push(uniqGrouping[g]);
            }
        });

    return result;
}

