const mongoose = require('mongoose');

const connection = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/db_redsocial")
        console.log('Base de datos conectada');
    } catch (error) {
        console.log(error);
        throw new Error("Error al iniciar la base de datos");
    }
}
module.exports = connection;