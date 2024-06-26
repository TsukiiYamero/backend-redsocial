import { model, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    bio: String,
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    nick_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "role_user"
    },
    img: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

userSchema.plugin(mongoosePaginate);

export const userM = model("User", userSchema, 'users');