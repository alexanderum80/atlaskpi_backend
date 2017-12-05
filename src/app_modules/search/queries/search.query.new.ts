
    @injectable()
    @query({
        name: 'search',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'sections', type: String, required: true, isArray: true },
            { name: 'query', type: String, required: true },
        ],
        output: { type: SearchResultItem, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<SearchResultItem[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<SearchResultItem[]> {
            // TODO: Add implementation here
        }
    }
    