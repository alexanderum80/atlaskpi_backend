declare var db;

db.revenues.aggregate([
    { "$match":
        { "employees.type": { "$eq": "f" } }
    },
    { $project: {
        employees: {
            $filter: {
                    input: '$employees',
                    as: 'employee',
                    cond: { $eq: ['$$employee.type', 'f'] }
                }
            },
          '_id': 0
        }
    },
    {
        $unwind: '$employees'
    },
    {
        $group: {
            _id: { employee: '$employees.id' },
            sales: { $sum: '$employees.amount' }
        }
    }
])


db.revenues.aggregate([
    { "$match":
        { $and: [
            { "employees.type": { "$eq": "f" } },
            { "employees.role": { "$eq": "Physician" } }
        ] }
    },
    { $project: {
        employees: {
            $filter: {
                    input: '$employees',
                    as: 'employee',
                    cond: { $and: [
                        { $eq: ['$$employee.type', 'f'] },
                        { $eq: ['$$employee.role', 'Physician'] }
                    ]}
                }
            },
          '_id': 0
        }
    },
    {
        $unwind: '$employees'
    },
    {
        $group: {
            _id: { employee: '$employees.id', name: '$employees.name' },
            sales: { $sum: '$employees.amount' }
        }
    }
])



db.revenues.aggregate([
    { "$match":
        { "employees.type": { "$eq": "f" } }
    },
    { $project: {
        timestamp: '$timestamp',
        employees: {
            $filter: {
                    input: '$employees',
                    as: 'employee',
                    cond: { $eq: ['$$employee.type', 'f'] }
                }
            },
          '_id': 0
        }
    },
    {
        $unwind: '$employees'
    },
    {
        $group: {
            _id: { id: '$employees.id', month: { $month: '$timestamp' }, year: { $year: '$timestamp' } },
            sales: { $sum: '$employees.amount' }
        }
    },
    {
        $sort: { '_id.id': 1, '_id.year': 1, '_id.month': 1 }
    }
])