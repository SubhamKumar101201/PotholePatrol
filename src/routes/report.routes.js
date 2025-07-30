import { Router } from 'express'
import { healthCheck, createReport, getAllReports } from '../controllers/report.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// for health check of the server
router.route('/healthcheck').get(healthCheck)

// for creating a new report
router.route('/create').post(upload.array("files", 5),createReport)

// for get all the reports
router.route('/get-all-reports/').get(verifyJWT, getAllReports)


export default router;
