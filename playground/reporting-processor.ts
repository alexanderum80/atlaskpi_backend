import { IKPI } from '../data/models/app/kpis';
import { ReportingProcessor } from '../data/queries/app/charts/reporting-processor';
import { getContext } from '../data/models/app';

let kpi: IKPI = {
    name: 'Net Collected Revenue per Full Time Employee (FTE)',
    description: 'Net Collected Revenue per Full Time Employee (FTE)',
    formula: 'Sum(Revenue.employees.amount)',
    grouping: { employee: '$employees.id' },
    filter: 'employees.type == "f"'
};

let kpi2: IKPI = {
    "name": "Average Revenue per FTE Physician",
    "description": "Total Physician Rev/Total # of Physicians",
    "formula": "Avg(Revenue.employees.amount/@Total)",
    "grouping": { "employee": "$employees.id" },
    "filter": "employees.type == 'f' && employees.role == 'Physician'"
};

export function TestReportingProcessor() {
    getContext('mongodb://localhost/customer2').then((ctx) => {
        let processors = new ReportingProcessor(ctx, kpi2);
        processors.getData().then((result) => {
            console.log(JSON.stringify(result));
        });
    });
}

