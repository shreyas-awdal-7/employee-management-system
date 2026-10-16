import { Router } from 'express'
import { applyLeave, cancelLeave, getLeaves, getMyLeaves, reviewLeave } from '../controllers/leaveController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/')
  .post(applyLeave)
  .get(authorize('admin', 'manager'), getLeaves)
router.get('/me', getMyLeaves)
router.patch('/:id/review', authorize('admin', 'manager'), reviewLeave)
router.patch('/:id/cancel', cancelLeave)

export default router
