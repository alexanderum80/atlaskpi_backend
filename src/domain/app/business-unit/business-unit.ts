// import { deleteAppointmentActivity } from '../../../../activities/app/appointments/delete-appointment.activity';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IBusinessUnit {
   name: string;
   serviceType: string;
  }

export interface IBusinessUnitDocument extends IBusinessUnit, mongoose.Document {

}

export interface IBusinessUnitModel extends mongoose.Model<IBusinessUnitDocument> {
    createNew(name: string, serviceType: string): Promise<IBusinessUnitDocument>;
    updateBusinessUnit(id: string, name: string, serviceType: string): Promise<IBusinessUnitDocument>;
    businessUnits(): Promise<IBusinessUnitDocument[]>;
    deleteBusinessUnit(id: string): Promise<IBusinessUnitDocument>;
    businessUnitById(id: string): Promise<IBusinessUnitDocument>;
}
