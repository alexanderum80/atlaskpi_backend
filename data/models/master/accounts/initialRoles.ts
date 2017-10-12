export const initialRoles  = {
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
            { action: 'All Fields', subject: 'Data' }
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
            { action: 'Edit', subject: 'KPI' },
            { action: 'Share', subject: 'KPI' },
            { action: 'Create', subject: 'KPI' },
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
            { action: 'All Fields', subject: 'Data' }
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
            { action: 'View', subject: 'SecurityLog' }
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
            { action: 'Manage', subject: 'KPI' }
        ],
        externalUser: [
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'All Fields', subject: 'Data' }
        ],
        viewer: [
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Import/Add', subject: 'Data' }
        ]
};


export const initAllPermissions = [
  {
    'action': 'View',
    'subject': 'Chart'
  },
  {
    'action': 'Delete Company Wide',
    'subject': 'Chart'
  },
  {
    'action': 'Share',
    'subject': 'Chart'
  },
  {
    'action': 'Add Comment on',
    'subject': 'Chart'
  },
  {
    'action': 'Modify',
    'subject': 'Chart'
  },
  {
    'action': 'Create',
    'subject': 'Chart'
  },
  {
    'action': 'Clone',
    'subject': 'Chart'
  },
  {
    'action': 'Delete',
    'subject': 'KPI'
  },
  {
    'action': 'Edit',
    'subject': 'KPI'
  },
  {
    'action': 'Share',
    'subject': 'KPI'
  },
  {
    'action': 'Create',
    'subject': 'KPI'
  },
  {
    'action': 'Clone',
    'subject': 'KPI'
  },
  {
    'action': 'Set',
    'subject': 'Targets'
  },
  {
    'action': 'Set Alerts for others',
    'subject': 'Users'
  },
  {
    'action': 'Modify Stored',
    'subject': 'Data'
  },
  {
    'action': 'Assign User to',
    'subject': 'DataEntry'
  },
  {
    'action': 'Activity',
    'subject': 'Feed'
  },
  {
    'action': 'Import/Add',
    'subject': 'Data'
  },
  {
    'action': 'Add New',
    'subject': 'DashboardTab'
  },
  {
    'action': 'Manage',
    'subject': 'DataSource'
  },
  {
    'action': 'Manage',
    'subject': 'KPI'
  },
  {
    'action': 'Manage',
    'subject': 'BusinessUnits'
  },
  {
    'action': 'View',
    'subject': 'SecurityLog'
  },
  {
    'action': 'Manage Access Levels',
    'subject': 'Users'
  },
  {
    'action': 'Assign Smi-Admin',
    'subject': 'Access'
  },
  {
    'action': 'Billing Information',
    'subject': 'Billing'
  },
  {
    'action': 'All Fields',
    'subject': 'Data'
  },
  {
    'action': 'View Library',
    'subject': 'KPI'
  }
];