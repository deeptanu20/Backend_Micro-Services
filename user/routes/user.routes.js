const express=require('express');
const router=express.Router();
const userController=require('../controllers/user.controller')

const authMiddleWare=require('../middleware/authMiddleWare')

router.post('/register',userController.register);
router.post('/login',userController.login);
router.get('/logout',userController.logout);
router.get('/profile',authMiddleWare.userAuth,userController.profile);
router.get('/accepted-ride',authMiddleWare.userAuth,userController.acceptedRide);

module.exports=router;
