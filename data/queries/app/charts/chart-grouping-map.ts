import { IChart, IChartDocument } from '../../../models/app/charts';
import * as _ from 'lodash';
// export interface IGroupingMap {
//     location: {
//         expenses: string,
//         sales: string;
//     };
// }

export const GroupingMap = {
    location: 'location.name',
    employee: 'employee.fullName',
    provider: 'employee.fullName',
    category: 'category.name',
    product: 'product.itemDescription',
    serviceType: 'serviceType',
    businessUnit: 'businessUnit.name',
    // expenses
    concept: 'expense.concept'
};

export function getGroupingMetadata(chartDocument: IChart, groupings: string[]) {
    if ((!chartDocument || !chartDocument.groupings) && !groupings) {
        return null;
    }

    if (!chartDocument) chartDocument = <any>{};

    let result: string[] = [];
    let groups: string[] = [];

    groups = groups.concat(chartDocument.groupings, groupings);

    groups.forEach(g => {
            let group = GroupingMap[g];

            if (group && result.indexOf(g) === -1) {
                result.push(GroupingMap[g]);
            }
        });

    return result;
}