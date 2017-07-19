// export interface IGroupingMap {
//     location: {
//         expenses: string,
//         sales: string;
//     };
// }

export const GroupingMap = {
    location: 'location.name',
    employee: 'employee.name'
};

export function getGroupingMetadata(groupings) {
    if (!groupings) {
        return null;
    }

    let result: string[] = [];

    groupings.forEach(g => {
        result.push(GroupingMap[g]);
    });

    return result;
}