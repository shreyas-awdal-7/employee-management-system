import { Router } from 'express'
import { checkIn, checkOut, getDailyAttendance, getMyAttendance } from '../controllers/attendanceController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.post('/check-in', checkIn)
router.post('/check-out', checkOut)
router.get('/me', getMyAttendance)
router.get('/', authorize('admin', 'manager'), getDailyAttendance)

export default router
