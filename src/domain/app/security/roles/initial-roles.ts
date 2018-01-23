export const initialRoles  = {
    owner: [],
    admin: [
            // chart
            { action: 'View', subject: 'Chart' },
            { action: 'Delete Company Wide', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Modify', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            // kpi
            { action: 'Delete', subject: 'KPI' },
            { action: 'Share', subject: 'KPI' },
            { action: 'Create', subject: 'KPI' },
            { action: 'Edit', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            { action: 'View Library', subject: 'KPI' },
            { action: 'Manage', subject: 'KPI' },
            // target
            { action: 'Set', subject: 'Targets' },
            { action: 'Set Alerts for others', subject: 'Users' },
            { action: 'Modify Stored', subject: 'Data' },
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Activity', subject: 'Feed' },
            { action: 'Import/Add', subject: 'Data' },
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'Manage', subject: 'BusinessUnits' },
            { action: 'View', subject: 'SecurityLog' },
            { action: 'Manage Access Levels', subject: 'Users' },
            { action: 'Assign Smi-Admin', subject: 'Access' },
            { action: 'Billing Information', subject: 'Billing' },
            { action: 'All Fields', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Modify', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            { action: 'Delete', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource
            { action: 'Create', subject: 'DataSource' },
            { action: 'View', subject: 'DataSource' },
            { action: 'Modify', subject: 'DataSource' },
            { action: 'Delete', subject: 'DataSource' },
            { action: 'Manage', subject: 'DataSource' },
            // employee
            { action: 'Create', subject: 'Employee' },
            { action: 'View', subject: 'Employee' },
            { action: 'Modify', subject: 'Employee' },
            { action: 'Delete', subject: 'Employee' },
            // businessunit
            { action: 'Create', subject: 'BusinessUnit' },
            { action: 'View', subject: 'BusinessUnit' },
            { action: 'Modify', subject: 'BusinessUnit' },
            { action: 'Delete', subject: 'BusinessUnit' },
            // department
            { action: 'Create', subject: 'Department' },
            { action: 'View', subject: 'Department' },
            { action: 'Modify', subject: 'Department' },
            { action: 'Delete', subject: 'Department' },
            // location
            { action: 'Create', subject: 'Location' },
            { action: 'View', subject: 'Location' },
            { action: 'Modify', subject: 'Location' },
            { action: 'Delete', subject: 'Location' },
            // slideshow
            { action: 'Create', subject: 'Slideshow' },
            { action: 'View', subject: 'Slideshow' },
            { action: 'Modify', subject: 'Slideshow' },
            { action: 'Delete', subject: 'Slideshow' }
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
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Modify', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            { action: 'Delete', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource
            { action: 'Create', subject: 'DataSource' },
            { action: 'View', subject: 'DataSource' },
            { action: 'Modify', subject: 'DataSource' },
            { action: 'Delete', subject: 'DataSource' },
            // employee
            { action: 'Create', subject: 'Employee' },
            { action: 'View', subject: 'Employee' },
            { action: 'Modify', subject: 'Employee' },
            { action: 'Delete', subject: 'Employee' },
            // businessunit
            { action: 'Create', subject: 'BusinessUnit' },
            { action: 'View', subject: 'BusinessUnit' },
            { action: 'Modify', subject: 'BusinessUnit' },
            { action: 'Delete', subject: 'BusinessUnit' },
            // department
            { action: 'Create', subject: 'Department' },
            { action: 'View', subject: 'Department' },
            { action: 'Modify', subject: 'Department' },
            { action: 'Delete', subject: 'Department' },
            // location
            { action: 'Create', subject: 'Location' },
            { action: 'View', subject: 'Location' },
            { action: 'Modify', subject: 'Location' },
            { action: 'Delete', subject: 'Location' },
            // slideshow
            { action: 'Create', subject: 'Slideshow' },
            { action: 'View', subject: 'Slideshow' },
            { action: 'Modify', subject: 'Slideshow' },
            { action: 'Delete', subject: 'Slideshow' }
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
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Modify', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource
            { action: 'Create', subject: 'DataSource' },
            { action: 'View', subject: 'DataSource' },
            { action: 'Modify', subject: 'DataSource' },
            // employee
            { action: 'Create', subject: 'Employee' },
            { action: 'View', subject: 'Employee' },
            { action: 'Modify', subject: 'Employee' },
            // businessunit
            { action: 'Create', subject: 'BusinessUnit' },
            { action: 'View', subject: 'BusinessUnit' },
            { action: 'Modify', subject: 'BusinessUnit' },
            // department
            { action: 'Create', subject: 'Department' },
            { action: 'View', subject: 'Department' },
            { action: 'Modify', subject: 'Department' },
            // location
            { action: 'Create', subject: 'Location' },
            { action: 'View', subject: 'Location' },
            { action: 'Modify', subject: 'Location' },
            // slideshow
            { action: 'Create', subject: 'Slideshow' },
            { action: 'View', subject: 'Slideshow' },
            { action: 'Modify', subject: 'Slideshow' }
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
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource
            { action: 'Create', subject: 'DataSource' },
            { action: 'View', subject: 'DataSource' },
            // employee
            { action: 'Create', subject: 'Employee' },
            { action: 'View', subject: 'Employee' },
            { action: 'Modify', subject: 'Employee' },
            // businessunit
            { action: 'Create', subject: 'BusinessUnit' },
            { action: 'View', subject: 'BusinessUnit' },
            // department
            { action: 'Create', subject: 'Department' },
            { action: 'View', subject: 'Department' },
            // location
            { action: 'Create', subject: 'Location' },
            { action: 'View', subject: 'Location' },
            // slideshow
            { action: 'Create', subject: 'Slideshow' },
            { action: 'View', subject: 'Slideshow' }
        ],
        externalUser: [
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'All Fields', subject: 'Data' },
            // widgetss
            { action: 'View', subject: 'Widget' },
            // slideshow
            { action: 'View', subject: 'Slideshow' }
        ],
        viewer: [
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Import/Add', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // employee
            { action: 'View', subject: 'Employee' },
            // slideshow
            { action: 'View', subject: 'Slideshow' }
        ]
};


export const allPermissions = [
  // CHART
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
  // KPI
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
    'action': 'Manage',
    'subject': 'KPI'
  },
  {
    'action': 'View Library',
    'subject': 'KPI'
  },
  // TARGET
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
  // DATASOURCE
  {
    'action': 'Create',
    'subject': 'DataSource'
  },
  {
    'action': 'View',
    'subject': 'DataSource'
  },
  {
    'action': 'Modify',
    'subject': 'DataSource'
  },
  {
    'action': 'Delete',
    'subject': 'DataSource'
  },
  {
    'action': 'Manage',
    'subject': 'DataSource'
  },
  // BUSINESS UNITS
  {
    'action': 'Create',
    'subject': 'BusinessUnits'
  },
  {
    'action': 'View',
    'subject': 'BusinessUnits'
  },
  {
    'action': 'Modify',
    'subject': 'BusinessUnits'
  },
  {
    'action': 'Delete',
    'subject': 'BusinessUnits'
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
  },
  // APPOINTMENT
  {
    'action': 'View',
    'subject': 'Appointments'
  },
  // LOCATION
  {
    'action': 'Create',
    'subject': 'Location'
  },
  {
    'action': 'View',
    'subject': 'Location'
  },
  {
    'action': 'Modify',
    'subject': 'Location'
  },
  {
    'action': 'Delete',
    'subject': 'Location'
  },
  // DEPARTMENT
  {
    'action': 'Create',
    'subject': 'Department'
  },
  {
    'action': 'View',
    'subject': 'Department'
  },
  {
    'action': 'Modify',
    'subject': 'Department'
  },
  {
    'action': 'Delete',
    'subject': 'Department'
  },
  // EMPLOYEE
  {
    'action': 'Create',
    'subject': 'Employee'
  },
  {
    'action': 'View',
    'subject': 'Employee'
  },
  {
    'action': 'Modify',
    'subject': 'Employee'
  },
  {
    'action': 'Delete',
    'subject': 'Employee'
  },
  // SLIDESHOW
  {
    'action': 'Create',
    'subject': 'Slideshow'
  },
  {
    'action': 'View',
    'subject': 'Slideshow'
  },
  {
    'action': 'Modify',
    'subject': 'Slideshow'
  },
  {
    'action': 'Delete',
    'subject': 'Slideshow'
  }
];