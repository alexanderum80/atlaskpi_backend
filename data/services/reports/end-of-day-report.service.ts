import { ReportServiceBase } from './report-service-base';
import { ISaleModel, ISaleDocument } from '../../models/app/sales';
import { IExpenseDocument, IExpenseModel } from '../../models/app/expenses';
import { IUserModel } from '../../models/app';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as logger from 'winston';

export enum IEndOfDayReportWinnerTypeEnum {
    Employee,
    Product
}

export interface IEndOfDayReportWinner {
    type: IEndOfDayReportWinnerTypeEnum;
    name: string;
    sales: number;
}

export interface IEndOfDayReport {
    sales: number;
    expenses: number;
    winners: IEndOfDayReportWinner[];
}


export class EndOfDayReportService extends ReportServiceBase<Promise<IEndOfDayReport>> {

    constructor(private _user: ISaleModel,
                private _target: IExpenseModel) {
                    super();
                }

    public generateReport(): Promise<IEndOfDayReport> {
        return new Promise<IEndOfDayReport>((resolve, reject) => {
            const dataPromise = {
                sales: this._getThisMonthSales(),
                expenses: this._getThisMonthExpenses()
            };

            Promise.props(dataPromise).then(data => {
                return {
                    sales: this._getSalesForToday(data.sales),
                    expenses: this._getExpensesForToday(data.expenses),
                    winners: this._getWinners(data.sales)
                };
            })
            .catch(err => {
                logger.error('There was an error generating the end of day report', err);
                reject(err);
            });
        });
    }

    private _getThisMonthSales(): ISaleDocument[] {}

    private _getThisMonthExpenses(): IExpenseDocument[] {}

    private _getSalesForToday(sales: ISaleDocument[]): number {}

    private _getExpensesForToday(expenses: IExpenseDocument[]): number {}

    private _getWinners(sales: ISaleDocument[]): IEndOfDayReportWinner[] {
        return [
            this._getWinnerEmployee(sales),
            this._getWinnerProduct(sales)
        ];
    }

    private _getWinnerEmployee(sales: ISaleDocument): IEndOfDayReportWinner {}

    private _getWinnerProduct(sales: ISaleDocument): IEndOfDayReportWinner {}

}