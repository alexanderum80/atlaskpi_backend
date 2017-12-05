
    @injectable()
    @query({
        name: 'users',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'details', type: PaginationDetails },
        ],
        output: { type: UserPagedQueryResult }
    })
    export class CreateBusinessUnitMutation extends MutationBase<UserPagedQueryResult> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<UserPagedQueryResult> {
            // TODO: Add implementation here
        }
    }
    