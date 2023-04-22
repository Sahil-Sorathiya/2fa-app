const Client = require("../models/client");

exports.verifyApiKey = async (req, res, next) => {
    try {
        const {clientApiKey} = req.body;

        const clientData = await Client.findOne({api: clientApiKey})
        if(!clientData) {
            return res.status(400).json({
                error: true,
                errorMessage: "API-key is incorrect"
            })
        }
        req.clientData = clientData;
        next()
    } catch (error) {
        res.status(400).json({
            error: true,
            errorMessage: error.message
        })
    }
}