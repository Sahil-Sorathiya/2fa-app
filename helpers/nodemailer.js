const nodemailer = require('nodemailer');

exports.sendMail = async (email, options)=>{
    console.log(typeof process.env.MAILHOST);
        const tranport = nodemailer.createTransport({
            host: process.env.MAILHOST,
            secure: true,
            port: 465,
            auth: {
                user: process.env.MAIL,
                pass: process.env.MAILPASS
            }
        })

        var subject = "";
        var htmlCode = "";
        if(options?.isRegister) {
            subject = "Registration Verification";
            htmlCode =  `
            <h4>This mail is sent by 2FA team</h4>
            <p>Click given link below to verify your email</p>
            <a href="${options.verificationUrl}">${options.verificationUrl}</a>
            <p style="color: red;">2FA is a project developed by CS students.If this process is not done by you kindly ignore this mail. If you are getting too many mails, contact to <a href="http://developersahil.tech">developersahil.tech</a></p>  
            `
        } else if(options?.isOtp) {
            subject = "2 Factor Authentication"
            htmlCode = `
            <h4>This mail is sent by 2FA team</h4>
            <p>Your OTP for <a href="https://${options.domainname}" target="_blank">${options.domainname}</a> is</p>
            <h5>${options.otpString}</h5>
            <p style="color: red;">2FA is a project developed by CS students.If this process is not done by you kindly ignore this mail. If you are getting too many mails, contact to <a href="http://developersahil.tech">developersahil.tech</a></p>  
            `
        } else if(options?.isForgotPassword) {
            subject = "Email Verification for reset the password"
            htmlCode =  `
            <h4>This mail is sent by 2FA team</h4>
            <p>Click given link below to verify your email</p>
            <a href="${options.verificationUrl}">${options.verificationUrl}</a>
            <p style="color: red;">2FA is a project developed by CS students.If this process is not done by you kindly ignore this mail. If you are getting too many mails, contact to <a href="http://developersahil.tech">developersahil.tech</a></p>  
            `
        }
        if(!subject || !htmlCode){
            return "Subject or Body of email not defined"
        }
        // TODO - Add text in html that when this mail is generated and after how much time it will expire
        const message = {
            from: process.env.MAIL,
            to: email,
            subject: subject,
            html: htmlCode
        }
        
        const info = await tranport.sendMail(message)
        return info;
}

