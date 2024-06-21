import { Schema, model } from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';

const followSchema = new Schema({
    following_user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    followed_user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})
/* indice */
followSchema.index({
    following_user: 1,
    followed_user: 1
}, { unique: true })

followSchema.plugin(mongoosePaginate);

export default model("Follow", followSchema, 'follows')

