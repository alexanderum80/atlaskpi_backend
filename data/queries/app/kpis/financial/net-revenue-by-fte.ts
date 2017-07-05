import {
  AggregateStage
} from '../aggregate';
import {
  ISaleModel
} from '../../../../models/app/sales';
import {
  KpiBase
} from '../kpi-base';
import {
  IAppModels
} from '../../../../models/app/app-models';
import {
  FrequencyEnum
} from '../../../../models/common/frequency-enum';
import {
  IDateRange
} from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

const aggregate: AggregateStage[] = [{
    dateRange: true,
    $match: {
      'employee.type': {
        '$eq': 'f'
      }
    }
  },
  {
    frequency: true,
    $project: {
      'product': 1,
      'employee': 1,
      '_id': 0
    }
  },
  {
    frequency: true,
    $group: {
      _id: {
        employeeId: '$employee.externalId',
        fullName: '$employee.fullName',
      },
      sales: {
        $sum: '$product.amount'
      }
    }
  },
  {
    $sort: {
      '_id.frequency': 1
    }
  }
];

export class NetRevenueByFTE extends KpiBase {

  constructor(sales: ISaleModel) {
    super(sales, aggregate);
  }

  getData(dateRange: IDateRange, frequency ?: FrequencyEnum): Promise < any > {
    let that = this;

    return new Promise<any>((resolve, reject) => {
          that.executeQuery('product.from', dateRange, frequency).then(data => {
              resolve(that._toSeries(data, frequency));
          }, (e) => reject(e));
      });
  }

  private _toSeries(rawData: any[], frequency: FrequencyEnum) {

    if (!frequency) {
      return [{
          name: 'Net Revenue',
          data: rawData.map(item => [ item._id.fullName, item.sales ])
      }];
    } else {
      let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
      let employees =  this._top5Employees(rawData);

      let data = rawData.filter((item, index) => {
                      if (frequencies.indexOf(item._id.frequency) === -1 ||
                          employees.indexOf(item._id.fullName) === -1)  { return; };
                      return item;
                });

      data = _.orderBy(data, ['_id.frequency', 'sales'], ['asc', 'desc']);

      data = _(data)
              .groupBy('_id.fullName')
              .map((v, k) => ({
                  name: k,
                  data: v.map(item => [item._id.frequency, item.sales])
              }))
              .value();

      return data;

      // let frequencyGroup = _.groupBy(rawData, '_id.frequency');
      // let categories = rawData.map(d => d._id.employeeId).sort();

      // let frequencies = Object.keys(frequencyGroup).map(f => {
      //   return {
      //     name: f,
      //     data: []
      //   };
      // });

      // let counter = 0;

      // frequencies.forEach(f => {
      //   let data = frequencyGroup[f.name];
      //   f.data = _.sortBy(data, '_id.employeeId').map(d => d.sales);
      // });
      // return frequencies;

      // categories.forEach(c => {
      //   employeeGroup[c].forEach(data => {
      //     if (frequencies[data._id.frequency]) {
      //       frequencies[data._id.frequency] = {};
      //     }

      //     let f = frequencies[data._id.frequency];

      //   });
      // });
      // return rawData.map(item => {
      //   return {
      //     name: item._id.frequency,
      //     data: 
      //   }
      }


      // return [{
      //       name: 'Net Revenue',
      //       data: rawData.map(item => [ item._id.employeeId, item.sales ])
      //   }];
    // }

  }
    private _top5Employees(rawData: any)  {
        return  _(rawData)
                .groupBy('_id.fullName')
                .map((v, k) => ({
                    fullName: k,
                    sales: _.sumBy(v, 'sales')
                }))
                .orderBy('sales', 'desc')
                .filter((item, index) => {
                    if (index > 4) { return; };
                    return item;
                })
                .map(item => item.fullName);
    }


}
