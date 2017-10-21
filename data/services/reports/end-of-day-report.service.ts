import { DateRange, IDateRange, parsePredifinedDate, PredefinedDateRanges } from '../../models/common';
import { ReportServiceBase } from './report-service-base';
import { ISaleModel, ISaleDocument } from '../../models/app/sales';
import { IExpenseDocument, IExpenseModel } from '../../models/app/expenses';
import { IUserModel } from '../../models/app';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as logger from 'winston';
import * as _ from 'lodash';

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

export class EndOfDayReportService extends ReportServiceBase<Promise<IEndOfDayReport>> {
    private _predefinedDateRange = PredefinedDateRanges.thisMonth;

    constructor(private _saleModel: ISaleModel,
                private _expenseModel: IExpenseModel) {
                    super();
                }

    public generateReport(): Promise<IEndOfDayReport> {
        const todayDateRange: IDateRange = parsePredifinedDate(PredefinedDateRanges.today);
        const thisMonthDateRange: IDateRange = parsePredifinedDate(PredefinedDateRanges.thisMonth);

        return new Promise<IEndOfDayReport>((resolve, reject) => {
            const dataPromise = {
                sales: this._getThisMonthSales(),
                expenses: this._getThisMonthExpenses()
            };

            Promise.props(dataPromise).then(data => {
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
        return this._saleModel.findByPredefinedDateRange(this._predefinedDateRange);
    }

    private _getThisMonthExpenses(): Promise<IExpenseDocument[]> {
        return this._expenseModel.findByPredefinedDateRange(this._predefinedDateRange);
    }

    private _getTotalSalesFor(dateRange: IDateRange, sales: ISaleDocument[]): number {
        const todaySales = _.filter(sales, s => {
            return s.product.from >= dateRange.from
                && s.product.to <= dateRange.to;
        });

        return todaySales.reduce((sum, s) => sum + s.product.paid, 0);
    }

    private _getExpensesFor(dateRange: IDateRange, expenses: IExpenseDocument[]): number {
        const todayExpenses = _.filter(expenses, e => {
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

        const productSalesSorted = _.toArray(itemsMap).sort();
        const biggestSale = _.last(productSalesSorted);

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