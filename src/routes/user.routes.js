import { Router } from "express"
import { 
    getCurrentUser, 
    updateUserDetails,  
    loginUser, 
    logoutUser, 
    forgetPassword,
    // refreshAccessToken, 
    registerUser 
} from "../controllers/user.controller.js"

const router = Router()

/*
router.post('/register', upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    }, 
    {
        name: 'coverImage',
        maxCount: 1
    }
]), registerUser )
*/

// register route
router.route('/register').post( registerUser )

// login route
router.route('/login').post( loginUser )

// ------- secured route ------- // 

// logout route
// router.route('/logout').post( verifyJWT, logoutUser )

// refresh token route (endpoint)
// router.route('/refresh-token').post( refreshAccessToken )

// change current password route
// router.route('/change-password').post( verifyJWT, forgetPassword )

// fetch current user route
// router.route('/current-user').get( verifyJWT, getCurrentUser )

// update account details route
// router.route('/update-account').patch( verifyJWT, updateAccountDetails )

export default router