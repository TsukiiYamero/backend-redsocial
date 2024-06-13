import { userM } from "../models/user.js";
import bcrypt from 'bcrypt';

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

        return res.status(200).json({
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