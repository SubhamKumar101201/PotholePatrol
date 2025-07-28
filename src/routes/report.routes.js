import { Router } from 'express'
import { healthCheck, createReport } from '../controllers/report.controller.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

router.route('/healthcheck').get(healthCheck)

router.route('/report').post(upload.array("files", 5),createReport)


export default router;
