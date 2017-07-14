// export interface IGroupingMap {
//     location: {
//         expenses: string,
//         sales: string;
//     };
// }

export const GroupingMap = {
    location: 'location.name'
};

export function getGroupingMetadata(grouping) {
    return GroupingMap[grouping];
}