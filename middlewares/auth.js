import jwt from 'jwt-simple'
import { secret } from '../services/jwt.js'
import moment from 'moment'

export const ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({
            message: 'Unauthorized not token found',
            status: "error"
        })
    }

    const token = req.headers.authorization.split(' ')[1]
    let payload = null

    try {
        payload = jwt.decode(token, secret)
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized', status: "error" })
    }

    if (payload.expireAt <= moment().unix()) {
        return res.status(401).json({ message: 'Expired Token', status: "error" })
    }

    req.user = payload
    next()
}


