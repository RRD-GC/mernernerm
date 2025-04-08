import express from 'express';
import { 
  createIntent, 
  getPaymentStatus, 
  attachMethod, 
  createSource 
} from '../controllers/payment.controller.js';

const router = express.Router();

// Payment Intent routes
router.post('/intent', createIntent);
router.get('/:paymentId/status', getPaymentStatus);
router.post('/:paymentId/attach', attachMethod);

// Payment Source routes
router.post('/source', createSource);

export default router;