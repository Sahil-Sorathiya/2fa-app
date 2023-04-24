//! # Must called after "isAuthenticated" middleware

exports.isAuthorized = async (req, res, next)=>{
    const clientData = req.clientData
    try {
        const clientid = req?.params?.clientid
        //: checking that clientid passed in url and in the token is equal or not
        if(clientid === clientData._id) {
            //: if equal, client is authorized
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