import { filter, last, toArray } from 'lodash';
import * as logger from 'winston';
import * as Bluebird from 'bluebird';

import { IExpenseDocument, IExpenseModel } from '../../domain/app/expenses/expense';
import { ISaleDocument, ISaleModel } from '../../domain/app/sales/sale';
import { IDateRange, parsePredefinedDate, PredefinedDateRanges } from '../../domain/common/date-range';
import { ReportServiceBase } from './report-service-base';
import { injectable, inject } from 'inversify';
import { CurrentUser } from '../../domain/app/current-user';


export interface IEndOfDayReportWinner {
    name: string;
    sales: number;
}

export interface IEndOfDayReportWinnerMap {
    employees: IEndOfDayReportWinner[];
    products: IEndOfDayReportWinner[];
}

export interface IEndOfDayReport {
    todaySales: number;
    monthSales: number;
    todayExpenses: number;
    winners: IEndOfDayReportWinnerMap;
}

@injectable()
export class EndOfDayReportService extends ReportServiceBase<Promise<IEndOfDayReport>> {
    private _predefinedDateRange = PredefinedDateRanges.thisMonth;

    @inject(CurrentUser.name) private _user: CurrentUser;

    constructor(private _saleModel: ISaleModel,
                private _expenseModel: IExpenseModel) {
                    super();
                }

    public generateReport(): Promise<IEndOfDayReport> {
        const todayDateRange: IDateRange = parsePredefinedDate(PredefinedDateRanges.today, this._user.get().profile.timezone);
        const thisMonthDateRange: IDateRange = parsePredefinedDate(PredefinedDateRanges.today, this._user.get().profile.timezone);

        return new Promise<IEndOfDayReport>((resolve, reject) => {
            const dataPromise = {
                sales: this._getThisMonthSales(),
                expenses: this._getThisMonthExpenses()
            };

            Bluebird.props(dataPromise).then(data => {
                const result = {
                    todaySales: this._getTotalSalesFor(todayDateRange, (<any>data).sales),
                    monthSales: this._getTotalSalesFor(thisMonthDateRange, (<any>data).sales),
                    todayExpenses: this._getExpensesFor(todayDateRange, (<any>data).expenses),
                    winners: this._getWinners(todayDateRange, (<any>data).sales)
                };

                resolve(result);
            })
            .catch(err => {
                logger.error('There was an error generating the end of day report', err);
                reject(err);
            });
        });
    }

    private _getThisMonthSales(): Promise<ISaleDocument[]> {
        return this._saleModel.findByPredefinedDateRange(this._predefinedDateRange, this._user.get().profile.timezone);
    }

    private _getThisMonthExpenses(): Promise<IExpenseDocument[]> {
        return this._expenseModel.findByPredefinedDateRange(this._predefinedDateRange, this._user.get().profile.timezone);
    }

    private _getTotalSalesFor(dateRange: IDateRange, sales: ISaleDocument[]): number {
        const todaySales = filter(sales, s => {
            return s.product.from >= dateRange.from
                && s.product.to <= dateRange.to;
        });

        return todaySales.reduce((sum, s) => sum + s.product.paid, 0);
    }

    private _getExpensesFor(dateRange: IDateRange, expenses: IExpenseDocument[]): number {
        const todayExpenses = filter(expenses, e => {
            return e.timestamp >= dateRange.from
                && e.timestamp <= dateRange.to;
        });

        return todayExpenses.reduce((sum, s) => sum + s.expense.amout, 0);
    }

    private _getWinners(dateRange: IDateRange, sales: ISaleDocument[]): IEndOfDayReportWinnerMap {
        return {
            employees: this._getEmployeeWinnerFor(dateRange, sales),
            products: this._getProductWinnerFor(dateRange, sales)
        };
    }

    private _getEmployeeWinnerFor(dateRange: IDateRange, sales: ISaleDocument[]): IEndOfDayReportWinner[] {
        let employeeMap: { [key: string]: number; } = {};

        // create employee map adding total sales
        sales.forEach(s => {
            employeeMap[s.employee.fullName] = (employeeMap[s.employee.fullName] || 0) + s.product.paid;
        });

        return this._pickWinners(employeeMap);
    }

    private _getProductWinnerFor(dateRange: IDateRange, sales: ISaleDocument[]): IEndOfDayReportWinner[] {
        let productMap: { [key: string]: number; } = {};

        // create employee map adding total sales
        sales.forEach(s => {
            productMap[s.product.itemDescription] = (productMap[s.product.itemDescription] || 0) + s.product.quantity;
        });

        return this._pickWinners(productMap);
    }

    private _pickWinners(itemsMap: { [key: string]: number; }): IEndOfDayReportWinner[] {
        let winners: IEndOfDayReportWinner[] = [];

        const productSalesSorted = toArray(itemsMap).sort();
        const biggestSale = last(productSalesSorted);

        // find out who the winner is
        Object.keys(itemsMap).forEach(e => {
            if (itemsMap[e] === biggestSale) {
                winners.push({
                    name: e,
                    sales: biggestSale
                });
            }
        });

        return winners;
    }
}