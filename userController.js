const userModel = require("../model/userModel")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer');
const otp = require("../commons/helper")
const config = require("../config/config")
const jwt = require("jsonwebtoken")
const qrcode = require("qrcode")
const randomstring = require("randomstring");
const { response } = require("express");

// 
const resetPasswordmail = async(name,email,token)=>{
    try{
      const transpoter =   nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'deepak.singh@indicchain.com',
                pass: 'pkzzwckxjkpoesks'
            }
        });
        const mailOptions = {
            from:'deepak.singh@indicchain.com',
            to:email,
            subject:"reset password",
            html:'<p> Hii'+name+' please copy the link  <a href="http://localhost:5000/api/resetpassword?Token='+token+'">reset the password</a></p>'
        }
        transpoter.sendMail(mailOptions,function(err,information){
            if(err){
                console.log(err)
            }
            else{
                console.log("mail has been sent",information.response)
            }
        })
    }
    
    catch(error){
        res.status(400).send({success:false,msg:error.message})
    }
}

// create token function
const create_token = async (id) => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt)
        return token;
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    signup: (req, res) => {
        try {
            userModel.findOne({ $or: [{ email: req.body.email }, { mobilenumber: req.body.mobilenumber }] }, (err, result1) => {
                if (err) {
                    return res.status(500).send({ responseMessage: "Internal server error" })

                }
                else if (result1) {
                    if (result1.email == req.body.email) {
                        return res.status(500).send({ responseMessage: "email already exists" })
                    }
                    else if (result1.mobilenumber == req.body.mobilenumber) {
                        return res.status(500).send({ responseMessage: "phone already exists" })
                    }
                }

                else {
                    // req.body.password = bcrypt.hashSync(req.body.password);
                    const hasspass = bcrypt.hashSync(req.body.password, 10)
                    req.body.password = hasspass

                    // otp

                    let otps = otp.generateOTP()
                    req.body.otp = otps;

                    // sending mail through nodemailer

                    var transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'deepak.singh@indicchain.com',
                            pass: 'pkzzwckxjkpoesks'
                        }
                    });

                    var mailOptions = {
                        from: "deepak89122@gmail.com",
                        to: req.body.email,
                        subject: 'Sending Email using Node.js',
                        text: `your otp is ${otps}`
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });


                    // -========================================================================

                    userModel(req.body).save((err, result) => {
                        if (err) {
                            return res.status(500).send({ responseMessage: "Internal server error" })

                        }
                        else {
                            return res.status(200).send({ responseMessage: "Signup success", result })
                        }
                    })
                }
            })
        } catch (error) {
            return res.status(501).send({ responseMessage: "Something went wrong", responseCode: 501, error: error })
        }
    },
    listuser: (req, res) => {
        try {     
            let { page, limit } = req.query

            if (!page) page = 1
            if (!limit) limit = 10
            const skip = (page - 1) * 10
            userModel.find({ req: req.body }, (err, result) => {
                if (err) {
                    return res.status(501).send({ responseMessage: "spomething went wrong" })
                } else {
                    return res.status(200).send({ responseMessage: "success", page: page, limit: limit, result })
                }
            }).skip(skip).limit(limit)
        } catch (error) {
            return res.status(501).send({ responseMessage: "Something went wrong", responseCode: 501, error: error })
        }
    },
    getuser: (req, res) => {
        try {
            userModel.findOne({ _id: req.body._id }, (err, result) => {
                if (err) {
                    return res.status(501).send({ responseMessage: "something went wrong" })
                } else {
                    return res.status(200).send({ responseMessage: "success", result })
                }
            })
        } catch (error) {
            return res.status(501).send({ responseMessage: "Something went wrong", responseCode: 501, error: error })
        }
    },

    otpverification: async (req, res) => {
        try {
            const userdata = await userModel.findOne({ email: req.body.email })
            if (userdata) {
                const otpdata = await userModel.findOneAndUpdate({ otp: req.body.otp }, { $set: { otpverify: true } })
                if (otpdata) {
                    return res.status(200).send({ respondcode: 200, responseMessage: "otp verification successful" })
                } else {
                    return res.status(400).send({ responseMessage: "otp not found" })
                }
            } else {
                return res.status(400).send({ responseMessage: "data not found" })
            }

        } catch (error) {
            return res.status(501).send({ respondcode: "something went wrong" })
        }
    },


    login: async (req, res) => {
        try {
            const email = req.body.email
            const password = req.body.password
            const userData = await userModel.findOne({ email: email })
            if (userData) {
                const passwordMatch = await bcrypt.compare(password, userData.password)
                if (passwordMatch) {
                    const tokenData = await create_token(userData._id)
                    const userResult = {
                        _id: userData._id,
                        name: userData.name,
                        email: userData.email,
                        password: userData.password,
                        mobilenumber: userData.mobilenumber,
                        type: userData.type,
                        token: tokenData
                    }
                    const response = {
                        success: true,
                        msg: "Login Successful",
                        data: userResult
                    }
                    res.status(200).send(response)
                } else {
                    res.status(200).send({ success: false, msg: "login detail are incorrect" })
                }
            } else {
                res.status(200).send({ success: false, msg: "login detail are incorrect" })
            }
        }
        catch (error) {
            res.status(400).send(error.message);
        }
    },
    qrcode: (req, res) => {
        try {
            let data = {
                name: "Employee Name",
                age: 27,
                department: "Police",
                id: "aisuoiqu3234738jdhf100223"
            }
            let stringdata = JSON.stringify(data)
            qrcode.toString(stringdata, { type: "terminal" }, function (err, qrcode) {
                if (err) {
                    return console.log("error")
                }
                else {
                    console.log(qrcode)
                }
            })
            qrcode.toDataURL(stringdata, function (err, code) {
                if (err) {
                    console.log("error")
                }
                else {
                    console.log(code)
                }
            })

        }
        catch (error) {
            res.status(400).send({ responseMessage: "internal server error" })
        } 
    },
    forgetpassword: async (req, res) => {
        try {
            const userData = await userModel.findOne({ email: req.body.email })

            if (userData) {
                const randomString = randomstring.generate()
                const data = await userModel.updateOne({ email: req.body.email }, { $set: { token: randomString } })
                resetPasswordmail(userData.name,userData.email,randomString) 
                res.status(200).send({success:true,msg:"please check your mail and reset your password"})
            }
            else {
                res.status(200).send({success: true, msg: "this email doesnot exist."})
            }
        }
        catch  (error) {
            res.status(400).send({ responseMessage: "internal server error" })
        }
    },
    resetpassword:async(req,res)=>{
        try {
            const token = req.query.token;
            const tokenData = await userModel.findOne({token:token})
           if(tokenData){
            const hasspass = await bcrypt.hash(req.query.password, 10)
            const usedata = await userModel.findByIdAndUpdate({_id:tokenData._id},{$set:{password:hasspass,token:""}},{new:true})
            res.status(200).send({success:true,msg:"user password has been reset",data:usedata})
            
           }
           else{
            res.status(200).send({success:false,msg:"this link has been expired"})
           }
        } catch (error) {
            res.status(404).send({success:"flase",msg:"internal server error"})
        } 
    },
    

}


