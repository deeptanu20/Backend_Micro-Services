const express=require('express');
const router=express.Router();
const captainController=require('../controllers/captain.controller')

const authMiddleWare=require('../middleware/authMiddleWare')

router.post('/register',captainController.register);
router.post('/login',captainController.login);
router.get('/logout',captainController.logout);
router.get('/profile',authMiddleWare.captainAuth,captainController.profile);
router.patch('/update-availability',authMiddleWare.captainAuth,captainController.updateAvailability);
router.get('/new-ride',authMiddleWare.captainAuth,captainController.waitForNewRide)

module.exports=router;
