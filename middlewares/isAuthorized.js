exports.isAuthorized = async (req, res, next)=>{
    const clientData = req.clientData
    // console.log(clientData);
    try {
        const clientid = req?.params?.clientid
        if(clientid === clientData._id) {
            return next()
        }
        return res.status(401).json({
            error: true,
            errorMessage: "Client is not authorized to perform this operation"
        })
    } catch (error) {
        return res.status(400).json({
            error: true,
            errorMessage: error.message
        })
    }
}