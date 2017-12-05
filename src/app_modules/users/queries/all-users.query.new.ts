
    @injectable()
    @query({
        name: 'allUsers',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'filter', type: String },
        ],
        output: { type: User, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<User[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<User[]> {
            // TODO: Add implementation here
        }
    }
    