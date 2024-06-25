/* importar */
import connection from "./connection.js";
import express, { json, urlencoded, } from "express";
import cors from "cors";
import { RouteFollow, RoutePublications, RouteUser } from "./utils/utils.js";
import { userRouter } from "./routes/user.js";
import routerFollow from "./routes/follow.js";
import routerPublication from "./routes/publications.js";

/* conexion */
connection();

/* config cors */

const app = express();
const port = 3900;

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

/* conversion de datos */

/* rutas */

app.use(`/api/v1/user`, userRouter);
app.use('/api/v1/follow', routerFollow);
app.use('/api/v1/publication', routerPublication);



app.get('/test', (req, res) => {
    console.log('hola mundo');
    return res.status(200).json({ message: 'hola mundo', id: '1' })
})


/* sevidor http */
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
})