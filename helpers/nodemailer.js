const nodemailer = require('nodemailer');

exports.sendMail = async (email, content, isOtp, domainname)=>{
        const tranport = nodemailer.createTransport({
            host: "smtp.zoho.in",
            secure: true,
            port: 465,
            auth: {
                user: process.env.MAIL,
                pass: process.env.MAILPASS
            }
        })

        const subject = isOtp ? "2 Factor Authentication" : "Registration Verification";
        const htmlCode = isOtp ? `
        <h4>This mail is sent by 2FA team</h4>
        <p>Your OTP for <a href="https://${domainname}" target="_blank">${domainname}</a> is</p>
        <h5>${content}</h5>
        <p style="color: red;">2FA is a project developed by CS students.If this process is not done by you kindly ignore this mail. If you are getting too many mails, contact to <a href="http://developersahil.tech">developersahil.tech</a></p>  
        ` : `
        <h4>This mail is sent by 2FA team</h4>
        <p>Click given link below to verify you email</p>
        <a href="${content}">${content}</a>
        <p style="color: red;">2FA is a project developed by CS students.If this process is not done by you kindly ignore this mail. If you are getting too many mails, contact to <a href="http://developersahil.tech">developersahil.tech</a></p>  
        ` ; 

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

