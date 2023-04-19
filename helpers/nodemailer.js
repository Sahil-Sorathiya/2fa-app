const nodemailer = require('nodemailer');

exports.sendMail = async (email, verificationUrl)=>{
    // console.log(verificationUrl);
        const tranport = nodemailer.createTransport({
            host: "smtp.zoho.in",
            secure: true,
            port: 465,
            auth: {
                user: process.env.MAIL,
                pass: process.env.MAILPASS
            }
        })

        const subject = "Registration Verification";
        const htmlCode = `
        <h4>This mail is sent by 2FA team</h4>
        <p>Click given link below to verify you email</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p style="color: red;">2FA is a project developed by CS students.If this process is not done by you kindly ignore this mail. If you are getting to many mails, contact to <a href="http://developersahil.tech">developersahil.tech</a></p>  
        `

        const message = {
            from: process.env.MAIL,
            to: email,
            subject: subject,
            html: htmlCode
        }
        
        const info = await tranport.sendMail(message)
        return info;
}

