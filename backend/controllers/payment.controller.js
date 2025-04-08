import { 
    createPaymentIntent, 
    retrievePaymentIntent, 
    checkPaymentStatus,
    createPaymentSource,
    attachPaymentMethod
  } from "../integration/paymongo.js";
  
  /**
   * Create a payment intent
   * @route POST /api/payments/intent
   * @access Public
   */
  export const createIntent = async (req, res) => {
    try {
      const { amount, currency = 'PHP', paymentMethodTypes = ['gcash', 'card'], metadata = {} } = req.body;
      
      if (!amount) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Amount is required' 
        });
      }
  
      const paymentIntent = await createPaymentIntent(
        Number(amount), 
        currency, 
        paymentMethodTypes,
        {
          ...metadata,
          user_id: req.user?.id || 'guest',
          ip_address: req.ip
        }
      );
      
      res.json({
        status: 'success',
        data: paymentIntent
      });
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      res.status(error.response?.status || 500).json({ 
        status: 'error',
        message: error.message,
        code: error.code || 'PAYMENT_INTENT_FAILED'
      });
    }
  };
  
  /**
   * Get payment status
   * @route GET /api/payments/:paymentId/status
   * @access Public
   */
  export const getPaymentStatus = async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Payment ID is required' 
        });
      }
      
      const status = await checkPaymentStatus(paymentId);
      
      res.json({
        status: 'success',
        data: status
      });
    } catch (error) {
      console.error('Payment status check failed:', error);
      res.status(error.response?.status || 500).json({ 
        status: 'error',
        message: error.message,
        code: error.code || 'PAYMENT_STATUS_CHECK_FAILED'
      });
    }
  };
  
  /**
   * Attach payment method to intent
   * @route POST /api/payments/:paymentId/attach
   * @access Public
   */
  export const attachMethod = async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { paymentMethodId } = req.body;
      
      if (!paymentId || !paymentMethodId) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Payment ID and payment method ID are required' 
        });
      }
      
      const result = await attachPaymentMethod(paymentId, paymentMethodId);
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Payment method attachment failed:', error);
      res.status(error.response?.status || 500).json({ 
        status: 'error',
        message: error.message,
        code: error.code || 'PAYMENT_METHOD_ATTACHMENT_FAILED'
      });
    }
  };
  
  /**
   * Create payment source
   * @route POST /api/payments/source
   * @access Public
   */
  export const createSource = async (req, res) => {
    try {
      const { amount, currency = 'PHP', type, redirectSuccess, redirectFailed } = req.body;
      
      if (!amount || !type) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Amount and payment type are required' 
        });
      }
      
      const source = await createPaymentSource(
        Number(amount), 
        currency, 
        type, 
        { redirectSuccess, redirectFailed }
      );
      
      res.json({
        status: 'success',
        data: source
      });
    } catch (error) {
      console.error('Payment source creation failed:', error);
      res.status(error.response?.status || 500).json({ 
        status: 'error',
        message: error.message,
        code: error.code || 'PAYMENT_SOURCE_FAILED'
      });
    }
  };