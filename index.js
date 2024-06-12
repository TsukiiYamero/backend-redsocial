/* importar */
const connection = require("./connection");
const express = require("express");
const cors = require("cors");
/* conexion */
connection();

/* config cors */

const app = require()
const port = 3900;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* conversion de datos */

/* rutas */
app.get('/test', (req, res) => {
    return res.status(200).json({ message: 'hola mundo', id: '1' })
})

/* sevidor http */
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
})