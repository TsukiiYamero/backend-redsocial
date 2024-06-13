export const testPublicationsController = (req, res) => {
    /* res.json('Test user controller'); */
    return res.status(200).send({
        message: 'testPublicationsController controller'
    });
}