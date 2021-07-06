import * as mongoose from 'mongoose';

export interface ITag extends mongoose.Document {
	name: string;
	content: string;
	owner: string;
	timeCreated: string;
}

export var Tag = new mongoose.Schema({
	name: { type: String },
	content: { type: String },
	owner: { type: String },
	timeCreated: { type: Number }
});

export default mongoose.model<ITag>('Tag', Tag);
