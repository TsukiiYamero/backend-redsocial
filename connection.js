import { connect } from 'mongoose';

const connection = async () => {
    try {
        await connect("mongodb://localhost:27017/db_redsocial")
        console.log('Base de datos conectada');
    } catch (error) {
        console.log(error);
        throw new Error("Error al iniciar la base de datos");
    }
}
export default connection;