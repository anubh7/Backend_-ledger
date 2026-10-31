const express=require("express")
const authController=require("../controllers/auth.controller")
const router=express.Router()


//ham yaha pr endpoints define kar rhe hai taki user register aur login kar ske. isme hamne register aur login ke liye endpoints banaye hai taki user apna account create kar ske aur login kar ske. isme hamne auth.controller ka use kiya hai taki user ka data validate ho aur agar user ka data valid hai to usko database me save kiya ja sake. isme hamne register aur login ke liye endpoints banaye hai taki user apna account create kar ske aur login kar ske.
// POST /api/auth/register
router.post("/register",authController.userRegister)

// POST /api/auth/login
router.post("/login",authController.userLogin)

//POST /api/auth/logout
router.post("/logout",authController.userLogout)




module.exports=router





