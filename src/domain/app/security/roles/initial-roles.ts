export const initialRoles  = {
    owner: [],
    admin: [
            // chart
            { action: 'View', subject: 'Chart' },
            { action: 'Delete', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Modify', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            // kpi
            { action: 'Delete', subject: 'KPI' },
            { action: 'Share', subject: 'KPI' },
            { action: 'Create', subject: 'KPI' },
            { action: 'Modify', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            { action: 'View', subject: 'KPI' },
            // target
            { action: 'Create', subject: 'Target' },
            { action: 'View', subject: 'Target' },
            { action: 'Modify', subject: 'Target' },
            { action: 'Delete', subject: 'Target' },
            { action: 'Set Alerts for others', subject: 'Users' },
            // data
            { action: 'Modify Stored', subject: 'Data' },
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Activity', subject: 'Feed' },
            { action: 'Import/Add', subject: 'Data' },
            // dashboard
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'View', subject: 'Dashboard' },
            { action: 'Modify', subject: 'Dashboard' },
            { action: 'Delete', subject: 'Dashboard' },

            { action: 'View', subject: 'SecurityLog' },
            // screen access and visibility
            { action: 'Manage Access Levels', subject: 'Users' },
            { action: 'Billing Information', subject: 'Billing' },
            // data field access
            { action: 'All Fields', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Modify', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            { action: 'Delete', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource/connector
            { action: 'Create', subject: 'Connector' },
            { action: 'View', subject: 'Connector' },
            { action: 'Modify', subject: 'Connector' },
            { action: 'Delete', subject: 'Connector' },
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
            { action: 'Delete', subject: 'Slideshow' },
            // roles
            { action: 'Create', subject: 'Role' },
            { action: 'View', subject: 'Role' },
            { action: 'Modify', subject: 'Role' },
            { action: 'Delete', subject: 'Role' },
            { action: 'Assign Smi-Admin', subject: 'Access' },
            { action: 'Assign Admin', subject: 'Access' },
            // users
            { action: 'Create', subject: 'User' },
            { action: 'View', subject: 'User' },
            { action: 'Modify', subject: 'User' },
            { action: 'Delete', subject: 'User' }
        ],
        semiAdmin: [
            // chart
            { action: 'View', subject: 'Chart' },
            { action: 'Delete', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Modify', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            // kpi
            { action: 'Create', subject: 'KPI' },
            { action: 'View', subject: 'KPI' },
            { action: 'Modify', subject: 'KPI' },
            { action: 'Delete', subject: 'KPI' },
            { action: 'Share', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            // target
            { action: 'Create', subject: 'Target' },
            { action: 'View', subject: 'Target' },
            { action: 'Modify', subject: 'Target' },
            { action: 'Delete', subject: 'Target' },
            { action: 'Set Alerts for others', subject: 'Users' },
            // data
            { action: 'Modify Stored', subject: 'Data' },
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Activity', subject: 'Feed' },
            { action: 'Import/Add', subject: 'Data' },
            // dashboard
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'View', subject: 'Dashboard' },
            { action: 'Modify', subject: 'Dashboard' },
            { action: 'Delete', subject: 'Dashboard' },

            // access levels
            { action: 'View', subject: 'SecurityLog' },
            // screen access and visibilty
            { action: 'Manage Access Levels', subject: 'Users' },
            { action: 'Billing Information', subject: 'Billing' },
            // data fields access
            { action: 'All Fields', subject: 'Data' },
            // widgets
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Modify', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            { action: 'Delete', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource/connector
            { action: 'Create', subject: 'Connector' },
            { action: 'View', subject: 'Connector' },
            { action: 'Modify', subject: 'Connector' },
            { action: 'Delete', subject: 'Connector' },
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
            { action: 'Delete', subject: 'Slideshow' },
            // users
            { action: 'Create', subject: 'User' },
            { action: 'View', subject: 'User' },
            { action: 'Modify', subject: 'User' },
            { action: 'Delete', subject: 'User' }
        ],
        manager: [
            // chart
            { action: 'View', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Modify', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            // kpi
            { action: 'Create', subject: 'KPI' },
            { action: 'View', subject: 'KPI' },
            { action: 'Share', subject: 'KPI' },
            { action: 'Modify', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            // target
            { action: 'Create', subject: 'Target' },
            { action: 'View', subject: 'Target' },
            { action: 'Modify', subject: 'Target' },
            { action: 'Set Alerts for others', subject: 'Users' },
            // data
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Activity', subject: 'Feed' },
            { action: 'Import/Add', subject: 'Data' },
            // dashboard
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'View', subject: 'Dashboard' },
            { action: 'Modify', subject: 'Dashboard' },
            // access levels
            { action: 'View', subject: 'SecurityLog' },
            // widgets
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Modify', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource
            { action: 'Create', subject: 'Connector' },
            { action: 'View', subject: 'Connector' },
            { action: 'Modify', subject: 'Connector' },
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
            { action: 'Modify', subject: 'Slideshow' },
            // users
            { action: 'Create', subject: 'User' },
            { action: 'View', subject: 'User' },
            { action: 'Modify', subject: 'User' }
        ],
        supervisor: [
            // chart
            { action: 'View', subject: 'Chart' },
            { action: 'Share', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            { action: 'Create', subject: 'Chart' },
            { action: 'Clone', subject: 'Chart' },
            // kpi
            { action: 'Create', subject: 'KPI' },
            { action: 'Clone', subject: 'KPI' },
            { action: 'View', subject: 'KPI' },
            // target
            { action: 'Create', subject: 'Target' },
            { action: 'View', subject: 'Target' },
            // data
            { action: 'Assign User to', subject: 'DataEntry' },
            { action: 'Import/Add', subject: 'Data' },
            // dashboard
            { action: 'Add New', subject: 'DashboardTab' },
            { action: 'View', subject: 'Dashboard' },
            // widgets
            { action: 'View', subject: 'Widget' },
            { action: 'Create', subject: 'Widget' },
            { action: 'Modify', subject: 'Widget' },
            { action: 'Clone', subject: 'Widget' },
            // appointments
            { action: 'View', subject: 'Appointment' },
            // datasource
            { action: 'Create', subject: 'Connector' },
            { action: 'View', subject: 'Connector' },
            { action: 'Modify', subject: 'Connector' },
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
            { action: 'View', subject: 'Slideshow' },
            // users
            { action: 'View', subject: 'User' },
            { action: 'Modify', subject: 'User' }
        ],
        externalUser: [
          // chart
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            // data
            { action: 'All Fields', subject: 'Data' },
            // target
            { action: 'View', subject: 'Target' },
            // dashboard
            { action: 'View', subject: 'Dashboard' },
            // widgets
            { action: 'View', subject: 'Widget' },
            // slideshow
            { action: 'View', subject: 'Slideshow' }
        ],
        viewer: [
            // chart
            { action: 'View', subject: 'Chart' },
            { action: 'Add Comment on', subject: 'Chart' },
            // data
            { action: 'Import/Add', subject: 'Data' },
            // target
            { action: 'View', subject: 'Target' },
            // dashboard
            { action: 'View', subject: 'Dashboard' },
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
    'action': 'Delete',
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
    'action': 'Modify',
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
    'action': 'View',
    'subject': 'KPI'
  },
  // TARGET
  {
    'action': 'Create',
    'subject': 'Target'
  },
  {
    'action': 'View',
    'subject': 'Target'
  },
  {
    'action': 'Modify',
    'subject': 'Target'
  },
  {
    'action': 'Delete',
    'subject': 'Target'
  },
  {
    'action': 'Set Alerts for others',
    'subject': 'Users'
  },
  // DATA
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
  // dashboard
  {
    'action': 'Add New',
    'subject': 'DashboardTab'
  },
  {
    'action': 'View',
    'subject': 'Dashboard'
  },
  {
    'action': 'Modify',
    'subject': 'Dashboard'
  },
  {
    'action': 'Delete',
    'subject': 'Dashboard'
  },
  // DATASOURCE/CONNECTOR
  {
    'action': 'Create',
    'subject': 'Connector'
  },
  {
    'action': 'View',
    'subject': 'Connector'
  },
  {
    'action': 'Modify',
    'subject': 'Connector'
  },
  {
    'action': 'Delete',
    'subject': 'Connector'
  },
  // BUSINESS UNITS
  {
    'action': 'Create',
    'subject': 'BusinessUnit'
  },
  {
    'action': 'View',
    'subject': 'BusinessUnit'
  },
  {
    'action': 'Modify',
    'subject': 'BusinessUnit'
  },
  {
    'action': 'Delete',
    'subject': 'BusinessUnit'
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
    'action': 'Assign Admin',
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
    'subject': 'Appointment'
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
  },
  // ROLES
  {
    'action': 'Create',
    'subject': 'Role'
  },
  {
    'action': 'View',
    'subject': 'Role'
  },
  {
    'action': 'Modify',
    'subject': 'Role'
  },
  {
    'action': 'Delete',
    'subject': 'Role'
  },
  // USERS
  {
    'action': 'Create',
    'subject': 'User'
  },
  {
    'action': 'View',
    'subject': 'User'
  },
  {
    'action': 'Modify',
    'subject': 'User'
  },
  {
    'action': 'Delete',
    'subject': 'User'
  }
];