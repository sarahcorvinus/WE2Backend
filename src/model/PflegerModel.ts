import {Model, model, Schema} from "mongoose"
import bcrypt from "bcryptjs"

interface IPflegerMethods{
    isCorrectPassword(toCheck: string): Promise<boolean> 
};

type PflegerModel = Model<IPfleger, {}, IPflegerMethods>;

export interface IPfleger{
    name: string
    password: string
    admin?: boolean 
};

const pflegerSchema = new Schema<IPfleger, PflegerModel, IPflegerMethods>({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    admin: {type: Boolean, default: false},
  }
);

pflegerSchema.pre("save", async function () {
    if(this.isModified("password")){
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
});

pflegerSchema.pre("updateOne", async function () {
    const update = this.getUpdate();
    if(update && "password" in update) {
        const hashedPassword = await bcrypt.hash(update.password, 10);
        update.password = hashedPassword;
    }
});

pflegerSchema.method("isCorrectPassword", function(toCheck: string): Promise<boolean> {
    if(this.isModified("password")) {
        throw new Error("Error! Can't compare password, some updates aren't yet saved.")
    }
    const isCorrect = bcrypt.compare(toCheck, this.password);
    return isCorrect;
});

export const Pfleger = model("Pfleger", pflegerSchema);