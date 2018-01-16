import { Milestones } from '../domain/app/milestones/milestone.model';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';


@injectable()
export class MilestoneService {
    constructor(@inject(Milestones.name) private _milestoneModel: Milestones) {}
      // milestoneQuery.forEach(m => {
      //   const forbiddenPastDate = moment(m.dueDate).isBefore(moment.utc().format('MM/DD/YYYY'));

      //   if (forbiddenPastDate && m.status === 'Due') {
      //     this._apollo.mutate({
      //       mutation: milestoneApi.updateStatus,
      //       variables: {
      //         _id: m._id
      //       }
      //     })
      //     .toPromise()
      //     .then(({data}) => {
      //     });
      //   }
      // });

    checkPastDate(milestones: any[]): Promise<any[]> {
        const that = this;
        return new Promise<any[]>((resolve, reject) => {
            if (!milestones || !milestones.length) { return resolve([]); }

            const promises = [];
            promises.push(milestones.map(milestone => {
                return that._milestoneModel.model.updateMilestoneStatus(milestone);
            }));

            Promise.all(promises).then(result => {
                resolve(result[0]);
                return;
            });
        });

    }
}