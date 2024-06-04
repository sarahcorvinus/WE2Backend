import {model, Schema, Types} from "mongoose"

export interface IEintrag{
    ersteller: Types.ObjectId
    protokoll: Types.ObjectId
    getraenk: string
    menge: number
    kommentar?: string
    createdAt?: Date
}

const eintragSchema = new Schema({ 
    ersteller: {type: Schema.Types.ObjectId, ref: "Pfleger", required: true},
    protokoll: {type: Schema.Types.ObjectId, ref: "Protokoll", required: true},
    getraenk: {type: String, required: true},
    menge: {type: Number, required: true},
    kommentar: {type: String}
},
    {timestamps: true}
);

export const Eintrag = model<IEintrag>("Eintrag", eintragSchema);