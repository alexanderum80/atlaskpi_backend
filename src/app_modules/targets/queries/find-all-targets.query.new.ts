
    @injectable()
    @query({
        name: 'findAllTargets',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'filter', type: String },
        ],
        output: { type: TargetResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<TargetResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<TargetResponse> {
            // TODO: Add implementation here
        }
    }
    