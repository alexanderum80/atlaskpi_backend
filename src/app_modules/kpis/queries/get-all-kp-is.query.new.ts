
    @injectable()
    @query({
        name: 'getAllKPIs',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'details', type: PaginationDetails },
        ],
        output: { type: KPIPagedQueryResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<KPIPagedQueryResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<KPIPagedQueryResult> {
            // TODO: Add implementation here
        }
    }
    