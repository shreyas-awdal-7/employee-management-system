import { Router } from 'express'
import { getMyStats, getStats } from '../controllers/dashboardController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/stats', authorize('admin', 'manager'), getStats)
router.get('/me', getMyStats)

export default router
