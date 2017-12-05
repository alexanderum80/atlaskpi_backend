
    @injectable()
    @query({
        name: 'slideShowsByGroupChart',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'group', type: String, required: true },
        ],
        output: { type: Slideshow, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Slideshow[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Slideshow[]> {
            // TODO: Add implementation here
        }
    }
    