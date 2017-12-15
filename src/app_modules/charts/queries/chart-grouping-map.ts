import * as _ from 'lodash';

import { IChart } from '../../../domain/app/charts/chart';


export const GroupingMap = {
    sales: {
        location: 'location.name',
        employee: 'employee.fullName',
        provider: 'employee.fullName',
        category: 'category.name',
        product: 'product.itemDescription',
        serviceType: 'serviceType',
        businessUnit: 'businessUnit.name'
    },
    expenses: {
        businessUnit: 'businessUnit.name',
        concept: 'expense.concept',
        location: 'location.name'
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
    _.each(GroupingMap, collection => {
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

