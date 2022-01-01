const User=require('../models/user')
const nodemailer=require('nodemailer')
require('dotenv').config()
const {ADMIN_MAIL_PASSWORD,ADMIN_MAIL}=process.env

module.exports.resetPassword=(req,res)=>{
    const id=req.params.id
    User.findOne({email:id}).exec()
    .then((doc)=>{
            const characters='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            let otp = ''    
            for (let i = 0; i < 6; i++) {
                otp += characters[Math.floor(Math.random() * characters.length )]
            }
            doc.otp=otp
            doc.save()
            const transport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                  user: ADMIN_MAIL,
                  pass: ADMIN_MAIL_PASSWORD,
                },
              })
              transport.sendMail({
                from: ADMIN_MAIL,
                to: doc.email,
                subject: "Password reset",
                html: `<h2>Hello ${doc.name}</h2>
                    <p>OTP to reset your password is: <h2>${otp}</h2></p>
                    <h3>If you have not requested to reset password. Ignore the message</h3>
                    </div>`,
              }).catch(err => console.log(err));
            res.json({status:200,message:"otp sent to email."})
    })
    .catch((e)=>    res.json({status:404,message:"this email is not registered"}))
}

module.exports.checkingOTP=(req,res)=>{
    const {email,code}=req.params
    User.findOne({email}).exec()
    .then((doc)=>{
       if(code===doc.otp){
          res.json({status:200,user:doc._id})
        }else{
            res.json({status:404,message:"incorrect OTP"})
        }
    })
    .catch((e)=>    res.json({status:404,message:"unauthorized access"}))
}

module.exports.updatePassword=(req,res)=>{
    const {password}=req.body
    const {id,otp}=req.params
    User.findById(id,function(e,doc){
        if(e){
            console.log(e)
            res.json({status:404,message:"cannot update now"})
        }else if(otp!==doc.otp){
            res.json({status:404,message:"unauthorized access"})
        }
        else{
            doc.password=password
            doc.save()
            .then(()=>res.json({status:200,message:"password updated successfully"}))
            .catch((e)=>res.json({status:404,message:"cannot update now"}))
        }
    })
}