export interface AggregateStage {
    filter?: boolean;
    postGroupFilter?: boolean;
    frequency?: boolean;
    topN?: boolean;

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