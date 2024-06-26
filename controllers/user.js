import { userM } from "../models/user.js";
import bcrypt from 'bcrypt';
import { createToken } from "../services/jwt.js";
import fs from "fs";
import { followThisUser, followUserIds } from "../services/followServices.js"
import path from "path";
import Follow from "../models/follow.js"
import Publication from "../models/publications.js"

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
        // Obtener el ID del usuario desde los parámetros de la URL
        const userId = req.params.id;

        // Verificar si el ID recibido del usuario autenticado existe
        if (!req.user || !req.user.userId) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no autenticado"
            });
        }

        // Buscar al usuario en la BD, excluimos la contraseña, rol, versión.
        const userProfile = await userM.findById(userId).select('-password -role -__v');

        // Verificar si el usuario existe
        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // Información de seguimiento - (req.user.userId = Id del usuario autenticado) 
        const followInfo = await followThisUser(req.user.userId, userId);

        // Devolver la información del perfil del usuario
        return res.status(200).json({
            status: "success",
            user: userProfile,
            followInfo
        });

    } catch (error) {
        console.log("Error al botener el perfil del usuario:", error);
        return res.status(500).send({
            status: "error",
            message: "Error al obtener el perfil del usuario"
        });
    }
}





export const listUsersC = async (req, res) => {
    try {
        const page = req.params.page ? parseInt(req.params.page, 10) : 1;
        const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;
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

        let followUsers = await followUserIds(req);

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
            nextPage: users.nextPage,
            users_following: followUsers.following,
            user_follow_me: followUsers.followers
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error al buscar los usuarios',
            status: "error"
        });
    }
}

export const updateUserC = async (req, res) => {
    try {
        // Recoger información del usuario a actualizar
        let userIdentity = req.user;
        let userToUpdate = req.body;
        // Validar que los campos necesarios estén presentes
        if (!userToUpdate.email || !userToUpdate.nick_name) {
            return res.status(400).send({
                status: "error",
                message: "¡Los campos email y nick son requeridos!"
            });
        }

        console.log(req.body)
        // Eliminar campos sobrantes
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        delete userToUpdate.image;

        // Comprobar si el usuario ya existe
        const users = await userM.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick_name.toLowerCase() }
            ]
        }).exec();

        // Verificar si el usuario está duplicado y evitar conflicto
        const isDuplicateUser = users.some(user => {
            return user && user._id.toString() !== userIdentity.userId;
        });

        if (isDuplicateUser) {
            return res.status(400).send({
                status: "error",
                message: "Solo se puede modificar los datos del usuario logueado."
            });
        }

        // Cifrar la contraseña si se proporciona
        if (userToUpdate.password) {
            try {
                let pwd = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = pwd;
            } catch (hashError) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al cifrar la contraseña"
                });
            }
        } else {
            delete userToUpdate.password;
        }

        // Buscar y Actualizar el usuario a modificar en la BD
        let userUpdated = await userM.findByIdAndUpdate(userIdentity.userId, userToUpdate, { new: true });
        console.log('aaa')
        if (!userUpdated) {
            return res.status(400).send({
                status: "error",
                message: "Error al actualizar el usuario"
            });
        }

        // Devolver respuesta exitosa con el usuario actualizado
        return res.status(200).json({
            status: "success",
            message: "¡Usuario actualizado correctamente!",
            user: userUpdated
        });
    } catch (error) {
        console.log("Error al actualizar los datos del usuario", error);
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar los datos del usuario"
        });
    }
}

export const uploadFilesC = async (req, res) => {
    try {
        const userId = req.user.userId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: 'No se ha subido ningún archivo',
                status: "error"
            });
        }

        const image = req.file.originalname;
        const imageSplit = image.split(".");
        const ext = imageSplit[imageSplit.length - 1];

        if (!['png', 'jpg', 'webp', 'jpeg'].includes(ext.toLowerCase())) {
            const filePath = req.file.path;
            fs.unlinkSync(filePath);

            return res.status(400).json({
                message: 'La extensión del archivo no es válida',
                status: "error"
            });
        }

        const userUpdated = await userM.findByIdAndUpdate(
            { _id: userId },
            { img: file.filename },
            { new: true }
        );

        if (!userUpdated) {
            return res.status(400).json({
                message: 'Error al actualizar la imagen del usuario',
                status: "error"
            });
        }

        return res.status(200).json({
            message: 'Imagen de usuario actualizada correctamente',
            status: "success",
            user: req.user,
            file: file
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error al actualizar la imagen del usuario',
            status: "error"
        });
    }
}

export const avatarC = async (req, res) => {
    try {
        // Obtener el parámetro de la url
        const file = req.params.file;

        // Obtener el path real de la imagen
        const filePath = "./uploads/avatars/" + file;

        // Comprobamos si existe
        fs.stat(filePath, (error, exists) => {
            if (!exists) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe la imagen"
                });
            }
            // Devolver el archivo
            return res.sendFile(path.resolve(filePath));
        });

    } catch (error) {
        console.log("Error al mostrar la imagen", error);
        return res.status(500).send({
            status: "error",
            message: "Error al mostrar la imagen"
        });
    }
}

export const counters = async (req, res) => {
    try {
        // Obtener el id del usuarios autenticado desde el token
        let userId = req.user.userId;

        // En caso de llegar el id del usuario en los parametros (por la url) se toma como prioritario
        if (req.params.id) {
            userId = req.params.id;
        }

        // Buscar el usuario por su userId para obtener nombre y apellido
        const user = await userM.findById(userId, { name: 1, last_name: 1 });

        // Si no encuentra al usuario
        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // Contar el número de usuarios que yo sigo (o el usuario autenticado)
        const followingCount = await Follow.countDocuments({ "following_user": userId });

        // Contar el número de usuarios que me siguen a mi (o al usuario autenticado)
        const followedCount = await Follow.countDocuments({ "followed_user": userId });

        // Contar el número de publicaciones que ha realizado el usuario
        const publicationsCount = await Publication.countDocuments({ "user_id": userId });

        // Devolver respuesta exitosa 
        return res.status(200).json({
            status: "success",
            userId,
            name: user.name,
            last_name: user.last_name,
            following: followingCount,
            followed: followedCount,
            publications: publicationsCount
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores"
        });
    }
}