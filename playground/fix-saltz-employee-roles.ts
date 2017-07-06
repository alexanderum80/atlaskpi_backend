import { getContext } from '../data/models/app/app-context';
import { IWorkLog, WorkLog } from '../data/models/app/work-log/IWorkLog';
import { FrequencyEnum } from '../data/models/common';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

interface IEmployeeWithRole {
    id: number;
    name: string;
    role: string;
    type: string;
    // fulltime - f, parttime - p
}

interface IHolliday {
    day: number;
    month: number;
}

const Employees: IEmployeeWithRole[] = [
    // fulltime
    {
        id: 4310,
        name: 'Jill',
        role: 'Aesthetician',
        type: 'f'
    },
    {
        id: 4312,
        name: 'Renato',
        role: 'Doctor',
        type: 'f'
    },
    {
        id: 4313,
        name: 'Tracee',
        role: 'Manager',
        type: 'f'
    },
    {
        id: 4314,
        name: 'Tara',
        role: 'Nurse',
        type: 'f'
    },
    {
        id: 4348,
        name: 'Patty',
        role: 'Aesthetician',
        type: 'f'
    },
    {
        id: 10524,
        name: 'Annete',
        role: 'Manager',
        type: 'f'
    },
    {
        id: 11861,
        name: 'Megan',
        role: 'FrontDesk',
        type: 'f'
    },
    {
        id: 12183,
        name: 'Jenanne',
        role: 'FrontDesk',
        type: 'f'
    },
    {
        id: 13178,
        name: 'Marli',
        role: 'Aesthetician'
    },
    {
        id: 13179,
        name: 'Malinda',
        role: 'Aesthetician',
        type: 'f'
    },

    // parttime
    {
        id: 4349,
        name: 'Torri',
        role: 'Aesthetician',
        type: 'p'
    },
    {
        id: 11947,
        name: 'Yulia',
        role: 'Therapist',
        type: 'p'
    },
    {
        id: 14276,
        name: 'Tana',
        role: 'FrontDesk',
        type: 'p'
    }
];


export function fixEmployeesRoles() {

    mongoose.set('debug', true);

    getContext('mongodb://localhost:47017/saltz-plastic-surgey').then(ctx => {

        Employees.forEach(e => {
            let query = { 'employee.externalId': String(e.id) };
            let newValue = { 'employee.role': e.role, 'employee.type': e.type };

            ctx.Sale.update(query, newValue, {multi: true}, (err, records) => {
                if (err) {
                    console.log('Error updating roles for emplouee: ' + e.name);
                    return;
                }
                console.log('Records updated for employee - ' + e.name + ' ' + records);
            });
        });
    });
}