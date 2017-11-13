import { IAppModels } from '../models/app/app-models';
import { getContext } from '../models';
import { initRoles } from '../../lib/rbac';
import * as winston from 'winston';

export default function seedRoles(connectionString) {
    getContext(connectionString).then((ctx) => {

        ctx.Role.find({}).then((roles) => {
              if (roles.length > 0) {
                  return;
              }

              winston.debug('Seeding roles for customer2');

                initRoles(ctx, {
                  owner: [],
                  admin: [
                    { action: 'View', subject: 'Chart' },
                    { action: 'Delete Company Wide', subject: 'Chart' },
                    { action: 'Share', subject: 'Chart' },
                    { action: 'Add Comment on', subject: 'Chart' },
                    { action: 'Modify', subject: 'Chart' },
                    { action: 'Create', subject: 'Chart' },
                    { action: 'Clone', subject: 'Chart' },
                    { action: 'Delete', subject: 'KPI' },
                    { action: 'Share', subject: 'KPI' },
                    { action: 'Create', subject: 'KPI' },
                    { action: 'Edit', subject: 'KPI' },
                    { action: 'Clone', subject: 'KPI' },
                    { action: 'Set', subject: 'Targets' },
                    { action: 'Set Alerts for others', subject: 'Users' },
                    { action: 'Modify Stored', subject: 'Data' },
                    { action: 'Assign User to', subject: 'DataEntry' },
                    { action: 'Activity', subject: 'Feed' },
                    { action: 'Import/Add', subject: 'Data' },
                    { action: 'View Library', subject: 'KPI' },
                    { action: 'Add New', subject: 'DashboardTab' },
                    { action: 'Manage', subject: 'DataSource' },
                    { action: 'Manage', subject: 'KPI' },
                    { action: 'Manage', subject: 'BusinessUnits' },
                    { action: 'View', subject: 'SecurityLog' },
                    { action: 'Manage Access Levels', subject: 'Users' },
                    { action: 'Assign Smi-Admin', subject: 'Access' },
                    { action: 'Billing Information', subject: 'Billing' },
                    { action: 'All Fields', subject: 'Data' },
                    // widgets
                    { action: 'View', subject: 'Widget'}
        ],
        semiAdmin: [
            { action: 'View', subject: 'Chart' },
            { action: 'Delete Company Wide', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Modify', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            { action: 'Delete', subject: 'KPI' },
            { action: 'Share', subject: 'KPI' },
            { action: 'Create', subject: 'KPI' },
            { action: 'Edit', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            { action: 'Set', subject: 'Targets' },
            { action: 'Set Alerts for others', subject: 'Users' },
            { action: 'Modify Stored', subject: 'Data' },
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Activity', subject: 'Feed' },
            { action: 'Import/Add', subject: 'Data' },
            { action: 'View Library', subject: 'KPI' },
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'Manage', subject: 'DataSource' },
            { action: 'Manage', subject: 'KPI' },
            { action: 'Manage', subject: 'BusinessUnits' },
            { action: 'View', subject: 'SecurityLog' },
            { action: 'Manage Access Levels', subject: 'Users' },
            { action: 'Billing Information', subject: 'Billing' },
            { action: 'All Fields', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget'}
        ],
        manager: [
            { action: 'View', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Modify', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            { action: 'Share', subject: 'KPI' },
            { action: 'Create', subject: 'KPI' },
            { action: 'Edit', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            { action: 'Set', subject: 'Targets' },
            { action: 'Set Alerts for others', subject: 'Users' },
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Activity', subject: 'Feed' },
            { action: 'Import/Add', subject: 'Data' },
            { action: 'View Library', subject: 'KPI' },
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'Manage', subject: 'KPI' },
            { action: 'View', subject: 'SecurityLog' },
            // widgets
            { action: 'View', subject: 'Widget'}
        ],
        supervisor: [
            { action: 'View', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            { action: 'Create', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            { action: 'Set', subject: 'Targets' },
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Import/Add', subject: 'Data' },
            { action: 'View Library', subject: 'KPI' },
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'Manage', subject: 'KPI' },
            // widgets
            { action: 'View', subject: 'Widget'}
        ],
        externalUser: [
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'All Fields', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget'}
        ],
        viewer: [
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Import/Add', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget'}
        ]
                }, []);
        });
    });
}