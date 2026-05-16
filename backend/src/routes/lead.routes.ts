import { Router } from 'express';
import * as leadController from '../controllers/lead.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createLeadSchema, updateLeadSchema, leadQuerySchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/stats', leadController.getLeadStats);
router.get('/export', validate(leadQuerySchema), leadController.exportLeads);
router.get('/', validate(leadQuerySchema), leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.post('/', validate(createLeadSchema), leadController.createLead);
router.patch('/:id', validate(updateLeadSchema), leadController.updateLead);
router.delete('/:id', authorize('admin', 'manager'), leadController.deleteLead);

export default router;
