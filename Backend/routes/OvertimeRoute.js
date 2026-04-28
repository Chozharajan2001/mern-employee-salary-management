import express from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import { 
    addOvertime, 
    getOvertimeByEmployee, 
    getAllOvertime,
    approveOvertime 
} from '../controllers/OvertimeController.js';

const router = express.Router();

router.post('/overtime', verifyUser, adminOnly, addOvertime);
router.get('/overtime', verifyUser, adminOnly, getAllOvertime);
router.get('/overtime/employee/:employee_id', verifyUser, adminOnly, getOvertimeByEmployee);
router.patch('/overtime/:id/approve', verifyUser, adminOnly, approveOvertime);

export default router;