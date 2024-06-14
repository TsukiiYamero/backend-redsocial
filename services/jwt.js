import jwt from 'jwt-simple'
import moment from 'moment'

const secret = 'secretKey'

const createToken = (user) => {
    const payload = {
        userId: user._id,
        role: user.role,
        createAt: moment().unix(),
        expireAt: moment().add(1, 'day').unix()
    }

    return jwt.encode(payload, secret)
}


export {
    secret,
    createToken
}