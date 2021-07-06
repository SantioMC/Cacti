import * as mongoose from 'mongoose';

export interface IInfraction extends mongoose.Document {
  id: string;
  type: string;
  guild: string;
  timePunished: number;
  length: number;
  victim: string;
  staff: string;
  reason: string;
  active: boolean;
}

export var Infraction = new mongoose.Schema({
  id: { type: String },
  type: { type: String },
  guild: { type: String },
  timePunished: { type: Number },
  length: { type: Number, default: -1 },
  victim: { type: String },
  staff: { type: String },
  reason: { type: String, default: 'No reason provided' },
  active: { type: Boolean, default: true, expires: 100 }
});

export default mongoose.model<IInfraction>('Infraction', Infraction);
