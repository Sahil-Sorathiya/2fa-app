exports.verifyRedirectionUrl = (req, res, next) => {
    try {
        const {redirectUrl} = req.body
        const parsedUrl = new URL(redirectUrl);

    if(req.domainData.domainname !== parsedUrl.host){
        return res.status(400).json({
            error: true,
            errorMessage: `Redirection is allowed only on your verified domain. your Redirectin URL host is '${parsedUrl.host}', but it must be '${req.domainData.domainname}'`
        })
    }

    return next();
        
    } catch (error) {
        return res.status(400).json({
            error: true,
            errorMessage: error.message
        })
    }
}