const  express  = require("express")
const Router = express.Router()
const userController = require("../controller/userController")
Router.post("/signup", userController.signup);
Router.get("/listuser",userController.listuser)
Router.get("/getuser",userController.getuser)
Router.get("/otpverification",userController.otpverification)
Router.post("/forgetpassword",userController.forgetpassword)
Router.get("/resetpassword",userController.resetpassword)
Router.post("/login",userController.login)
Router.get("/qrcode",userController.qrcode)

// staff and right controller
const staff = require("../controller/staffController")
const right = require("../controller/rightController")
Router.post("/staff/create",staff.create)
Router.post("/staff/create",right.create)

module.exports = Router;
