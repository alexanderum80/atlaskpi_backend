import { IChartDocument } from '../../../models/app/charts';
import * as _ from 'lodash';
// export interface IGroupingMap {
//     location: {
//         expenses: string,
//         sales: string;
//     };
// }

export const GroupingMap = {
    location: 'location.name',
    employee: 'employee.externalId',
    category: 'category.name',
    // expenses
    concept: 'expense.concept'
};

export function getGroupingMetadata(chartDocument: IChartDocument, groupings: string[]) {
    if (!chartDocument.groupings && !groupings) {
        return null;
    }

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