export const initialRoles  = {
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
            { action: 'View', subject: 'Widget'},
            { action: 'Create', subject: 'Widget'},
            { action: 'Modify', subject: 'Widget'},
            { action: 'Clone', subject: 'Widget'},
            { action: 'Delete', subject: 'Widget'},
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
            { action: 'All Fields', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget'},
            { action: 'Create', subject: 'Widget'},
            { action: 'Modify', subject: 'Widget'},
            { action: 'Clone', subject: 'Widget'},
            { action: 'Delete', subject: 'Widget'},
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
            { action: 'View', subject: 'Widget'},
            { action: 'Create', subject: 'Widget'},
            { action: 'Modify', subject: 'Widget'},
            { action: 'Clone', subject: 'Widget'},
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
            { action: 'View', subject: 'Widget'},
            { action: 'Create', subject: 'Widget'},
            { action: 'Clone', subject: 'Widget'},
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
            { action: 'View', subject: 'Widget'},
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
  },
  // Widgets
  {
    'action': 'View',
    'subject': 'Widget'
  },
  {
    'action': 'Create',
    'subject': 'Widget'
  },
  {
    'action': 'Modify',
    'subject': 'Widget'
  },
  {
    'action': 'Clone',
    'subject': 'Widget'
  },
  {
    'action': 'Delete',
    'subject': 'Widget'
  }
];