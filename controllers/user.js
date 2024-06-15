import { userM } from "../models/user.js";
import bcrypt from 'bcrypt';
import { createToken } from "../services/jwt.js";

export const testUserController = (req, res) => {
    /* res.json('Test user controller'); */
    return res.status(200).send({
        message: 'Test user controller'
    });
}

export const userRegisterC = async (req, res) => {
    /* res.json('Test user controller'); */

    try {

        const params = req.body;

        if (!params || !params.name || !params.nick_name || !params.last_name || !params.email || !params.password) {
            return res.status(400).json({
                message: 'Faltan datos por enviar',
                status: "error"
            });
        }

        const userToSave = new userM(params);

        const exist = await userM.findOne({
            $or: [
                { email: userToSave.email.toLowerCase() },
                { nick_name: userToSave.nick_name.toLowerCase() }
            ]
        });

        console.log(exist);

        if (exist) {
            return res.status(400).json({
                message: 'El usuario ya existe',
                status: "error"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userToSave.password, salt);

        userToSave.password = hashedPassword;
        await userToSave.save();

        return res.status(201).json({
            message: 'Usuario registrado correctamente',
            status: "success",
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error al registrar el usuario',
            status: "error"
        });
    }

}

export const loginC = async (req, res) => {
    try {
        const params = req.body;

        if (!params || !params.email || !params.password) {
            return res.status(400).json({
                message: 'Faltan datos por enviar',
                status: "error"
            });
        }

        const exist = await userM.findOne({ email: params.email });

        if (!exist) {
            return res.status(404).json({
                message: 'El usuario no existe',
                status: "error"
            });
        }

        const passwordMatch = await bcrypt.compare(params.password, exist.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Contraseña incorrecta',
                status: "error"
            });
        }

        const token = createToken(exist);

        const { password, ...user } = exist.toObject();

        return res.status(200).json({
            message: 'Usuario logueado correctamente',
            status: "success",
            user: user,
            token
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error al loguear el usuario',
            status: "error"
        });
    }
}

export const profileC = async (req, res) => {
    try {
        const user = await userM.findById(req.params.id).select('-password -role -__v');
        if (!user) {
            return res.status(404).json({
                message: 'El usuario no existe',
                status: "error"
            });
        }

        const { ...userData } = user.toObject();

        return res.status(200).json({
            message: 'Usuario encontrado correctamente',
            status: "success",
            user: userData
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error al buscar el usuario',
            status: "error"
        });
    }
}

export const listUsersC = async (req, res) => {
    try {
        const page = req.param.page ? parseInt(req.params.page, 10) : 1;
        const itemsPerPage = req.query.limi ? parseInt(req.query.limi, 10) : 5;
        const option = {
            page: page,
            limit: itemsPerPage,
            select: '-password -role -__v'
        }

        const users = await userM.paginate({}, option);

        if (!users || users.docs.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron usuarios',
                status: "error"
            });
        }

        return res.status(200).json({
            message: 'Usuarios encontrados correctamente',
            status: "success",
            users: users.docs,
            totalDocs: users.totalDocs,
            totalPages: users.totalPages,
            page: users.page,
            pagingCounter: users.pagingcounger,
            hasPrevPage: users.hasPrevPage,
            hasNextPage: users.hasNextPage,
            prevPage: users.prevPage,
            nextPage: users.nextPage
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error al buscar los usuarios',
            status: "error"
        });
    }
}

