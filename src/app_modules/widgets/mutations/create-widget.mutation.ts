
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Widgets } from '../../../domain';
import { WidgetMutationResponse, WidgetInput } from '../widgets.types';
import { CreateWidgetActivity } from '../activities';

@injectable()
@mutation({
    name: 'createWidget',
    activity: CreateWidgetActivity,
    parameters: [
        { name: 'input', type: WidgetInput, required: true },
    ],
    output: { type: WidgetMutationResponse }
})
export class CreateWidgetMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Widgets') private _widgets: Widgets) {
        super();
    }

    run(data: { input: WidgetInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._widgets.model.createWidget(data.input)
                .then(widget =>  {
                    resolve({ entity: widget, success: true });
                    return;
                })
                .catch(err => {
                    resolve({success: false, errors: [{ field: 'widget', errors: [err]} ]});
                    return;
                });
        });
    }
}
