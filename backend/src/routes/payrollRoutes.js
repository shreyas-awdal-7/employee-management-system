import { Router } from 'express'
import {
  downloadPayslip, getMyPayslips, getPayrolls, markPaid, runPayroll,
} from '../controllers/payrollController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/me', getMyPayslips)
router.get('/:id/slip', downloadPayslip)
router.post('/generate', authorize('admin'), runPayroll)
router.get('/', authorize('admin'), getPayrolls)
router.patch('/:id/pay', authorize('admin'), markPaid)

export default router
