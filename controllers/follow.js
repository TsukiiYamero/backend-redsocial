export const testFollowController = (req, res) => {
    /* res.json('Test user controller'); */
    return res.status(200).send({
        message: 'testFollowController controller'
    });
}