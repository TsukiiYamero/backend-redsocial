import Follow from '../models/follow.js'
import { userM } from "../models/user.js";
import { followUserIds } from '../services/followServices.js';

/* diegosfera 11  */
/* 666ce1b44cc7d771d66b97b3 */
/* diegosfera 10  */
/* 666ce1ab4cc7d771d66b97b0 */

export const testFollowController = (req, res) => {
    /* res.json('Test user controller'); */
    return res.status(200).send({
        message: 'testFollowController controller'
    });
}

// Ash es REEE gay

export const saveFollowC = async (req, res) => {
    try {
        // Obtener datos del body
        const { followed_user } = req.body;

        // Obtener el id del usuario autenticado (login) desde el token
        const identity = req.user;

        // Verificar si "identity" contiene la información del usuario autenticado
        if (!identity || !identity.userId) {
            return res.status(400).send({
                status: "error",
                message: "No se ha proporcionado el usuario para realizar el following"
            });
        }

        // Verificar si el usuario está intentando seguirse a sí mismo
        if (identity.userId === followed_user) {
            return res.status(400).send({
                status: "error",
                message: "No puedes seguirte a ti mismo"
            });
        }

        // Verificar si el usuario a seguir existe
        const followedUser = await userM.findById(followed_user);
        if (!followedUser) {
            return res.status(404).send({
                status: "error",
                message: "El usuario que intentas seguir no existe"
            });
        }

        // Verificar si ya existe un seguimiento con los mismos usuarios
        const existingFollow = await Follow.findOne({
            following_user: identity.userId,
            followed_user: followed_user
        });

        if (existingFollow) {
            return res.status(400).send({
                status: "error",
                message: "Ya estás siguiendo a este usuario."
            });
        }

        // Crear el objeto con modelo follow
        const newFollow = new Follow({
            following_user: identity.userId,
            followed_user: followed_user
        });

        // Guardar objeto en la BD
        const followStored = await newFollow.save();

        // Verificar si se guardó correctamente en la BD
        if (!followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido seguir al usuario."
            });
        }

        // Obtener el nombre y apellido del usuario seguido
        const followedUserDetails = await User.findById(followed_user).select('name last_name');
        console.log(followedUserDetails)
        if (!followedUserDetails) {
            return res.status(404).send({
                status: "error",
                message: "Usuario seguido no encontrado"
            });
        }

        // Combinar datos de follow y followedUser
        const combinedFollowData = {
            ...followStored.toObject(),
            followedUser: {
                name: followedUserDetails.name,
                last_name: followedUserDetails.last_name
            }
        };


        // Devolver respuesta
        return res.status(200).json({
            status: "success",
            identity: req.user,
            follow: combinedFollowData
        });

    } catch (error) {
        if (error.code === 11000) { // Error de índice único duplicado
            return res.status(400).json({
                status: "error",
                message: "Ya estás siguiendo a este usuario."
            });
        }
        return res.status(500).json({
            status: "error",
            message: "Error al seguir al usuario.",
        });
    }
}

export const unfollow = async (req, res) => {
    try {
        // Obtener el Id del usuario indentificado
        const userId = req.user.userId;

        // Obtener el Id del usuario que sigo y quiero dejar de seguir
        const followedId = req.params.id;

        // Búsqueda de las coincidencias de ambos usuarios y elimina
        const followDeleted = await Follow.findOneAndDelete({
            following_user: userId, // quien realiza el seguimiento
            followed_user: followedId // a quien se quiere dejar de seguir
        });

        // Verificar si se encontró el documento y lo eliminó
        if (!followDeleted) {
            return res.status(404).send({
                status: "error",
                message: "No se encontró el seguimiento a eliminar."
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Dejaste de seguir al usuario correctamente."
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al dejar de seguir al usuario."
        });
    }
}
// Método para listar usuarios que estoy siguiendo
export const following = async (req, res) => {
    try {
        // Obtener el ID del usuario identificado
        let userId = req.user && req.user.userId ? req.user.userId : undefined;

        // Comprobar si llega el ID por parámetro en la url (este tiene prioridad)
        if (req.params.id) userId = req.params.id;

        // Asignar el número de página
        let page = req.params.page ? parseInt(req.params.page, 10) : 1;

        // Número de usuarios que queremos mostrar por página
        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

        // Configurar las opciones de la consulta
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: {
                path: 'following_user',
                select: '-password -role -__v'
            },
            lean: true
        }

        // Buscar en la BD los seguidores y popular los datos de los usuarios
        const follows = await Follow.paginate({ followed_user: userId }, options);

        const followUsers = await followUserIds(req);


        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows: follows.docs,
            total: follows.totalDocs,
            pages: follows.totalPages,
            page: follows.page,
            limit: follows.limit,
            users_following: followUsers.following,
            user_follow_me: followUsers.followers
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al listar los usuarios que estás siguiendo."
        });
    }
}

export const followers = async (req, res) => {
    try {
        // Obtener el ID del usuario identificado
        let userId = req.user && req.user.userId ? req.user.userId : undefined;

        // Comprobar si llega el ID por parámetro en la url (este tiene prioridad)
        if (req.params.id) userId = req.params.id;

        // Asignar el número de página
        let page = req.params.page ? parseInt(req.params.page, 10) : 1;

        // Número de usuarios que queremos mostrar por página
        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

        // Configurar las opciones de la consulta
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: {
                path: 'following_user',
                select: '-password -role -__v'
            },
            lean: true
        }

        // Buscar en la BD los seguidores y popular los datos de los usuarios
        const follows = await Follow.paginate({ followed_user: userId }, options);

        // Listar los seguidores de un usuario, obtener el array de IDs de los usuarios que sigo
        let followUsers = await followUserIds(req);

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows: follows.docs,
            total: follows.totalDocs,
            pages: follows.totalPages,
            page: follows.page,
            limit: follows.limit,
            users_following: followUsers.following,
            user_follow_me: followUsers.followers
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al listar los usuarios que me siguen."
        });
    }
}
