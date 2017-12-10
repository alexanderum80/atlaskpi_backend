import { getContext } from '../data/models/app/app-context';
import { IWorkLog, WorkLog } from '../data/models/app/work-log/IWorkLog';
import { FrequencyEnum } from '../data/models/common';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

interface IEmployee {
    id: number;
    name: string;
    fulltime: boolean;
}

interface IHolliday {
    day: number;
    month: number;
}

const Employees: IEmployee[] = [
    // fulltime
    {
        id: 4310,
        name: 'Jill',
        fulltime: true,
    },
    {
        id: 4312,
        name: 'Renato',
        fulltime: true
    },
    {
        id: 4313,
        name: 'Tracee',
        fulltime: true
    },
    {
        id: 4314,
        name: 'Tara',
        fulltime: true,
    },
    {
        id: 4348,
        name: 'Patty',
        fulltime: true
    },
    {
        id: 10524,
        name: 'Annete',
        fulltime: true
    },
    {
        id: 11861,
        name: 'Megan',
        fulltime: true
    },
    {
        id: 12183,
        name: 'Jenanne',
        fulltime: true
    },
    {
        id: 13178,
        name: 'Marli',
        fulltime: true
    },
    {
        id: 13179,
        name: 'Malinda',
        fulltime: true
    },

    // parttime
    {
        id: 4349,
        name: 'Torri',
        fulltime: false
    },
    {
        id: 11947,
        name: 'Yulia',
        fulltime: false
    },
    {
        id: 12492,
        name: 'Sandy',
        fulltime: false
    },
    {
        id: 14081,
        name: 'Marlo',
        fulltime: false
    },
    {
        id: 14276,
        name: 'Tana',
        fulltime: false
    },
    {
        id: 14513,
        name: 'Steph',
        fulltime: false
    }
];


export function fillEmployeeHours() {

    mongoose.set('debug', true);

    getContext('mongodb://localhost:47017/saltz-plastic-surgery').then(ctx => {

        let start = moment('2007-01-01');
        let end = moment('2017-07-07');

        let logs: IWorkLog[] = [];

        for (let m = moment(start); m.isBefore(end); m.add('days', 1)) {
            if (m.isoWeekday() === 6 || m.isoWeekday() === 7) { continue; }
            console.log('Inserting time records for day: ' + m.format('dddd') + ' ' + m.format('YYYY-MM-DD'));

            Employees.forEach(e => {
                logs.push(getLogByEmployee(e, new Date(m.toString())));
            });
        }

        ctx.WorkLog.insertMany(logs).then((docs) => {
            console.log('Inserted worklogs records: ' + docs.length);
        })
        .catch((err) => {
            console.log(err);
        });
    });
}

function getLogByEmployee(e: IEmployee, date: Date): IWorkLog {
    if (e.fulltime) {
        return new WorkLog(date, e.id, 28800);
    }

    return new WorkLog(date, e.id, 14400);
}