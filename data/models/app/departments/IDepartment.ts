// import { deleteAppointmentActivity } from '../../../../activities/app/appointments/delete-appointment.activity';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IDepartment {
    name: string;
    manager: string;
  }

export interface IDepartmentDocument extends IDepartment, mongoose.Document {

}

export interface IDepartmentModel extends mongoose.Model<IDepartmentDocument> {
    createNew(name: string, manager: string): Promise<IDepartmentDocument>;
    updateDepartment(id: string, name: string, manager: string): Promise<IDepartmentDocument>;
    departments(): Promise<IDepartmentDocument[]>;
    departmentById(id: string): Promise<IDepartmentDocument>;
    deleteDepartment(id: string): Promise<IDepartmentDocument>;
}
