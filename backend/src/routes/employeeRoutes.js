import { Router } from 'express'
import {
  createEmployee, deleteEmployee, getEmployee, getEmployees, updateEmployee, updateMe,
} from '../controllers/employeeController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.put('/me', updateMe)
router.route('/')
  .get(authorize('admin', 'manager'), getEmployees)
  .post(authorize('admin'), createEmployee)
router.route('/:id')
  .get(getEmployee)
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee)

export default router
