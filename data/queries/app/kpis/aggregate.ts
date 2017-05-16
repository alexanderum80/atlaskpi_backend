export interface AggregateStage {
    dateRange?: boolean;
    frequency?: boolean;

    $match?: any;
    $project?: any;
    $group?: any;
    $sort?: any;
    $redact?: any;
    $limit?: any;
    $skip?: any;
    $unwind?: any;
    $sample?: any;
    $geoNear?: any;
    $lookup?: any;
    $out?: any;
    $sortByCount?: any;
    $addFields?: any;
    $count?: any;
}