import { Router } from 'express'
import {
  createDepartment, deleteDepartment, getDepartments, updateDepartment,
} from '../controllers/departmentController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/')
  .get(getDepartments)
  .post(authorize('admin'), createDepartment)
router.route('/:id')
  .put(authorize('admin'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment)

export default router
