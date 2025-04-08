import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Configures request headers with authentication and optional idempotency key
 * 
 * @param {string} idempotencyKey - Unique key for the request to prevent duplicates
 * @returns {Object} Headers object
 */
const getHeaders = (idempotencyKey = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`
  };
  
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  
  return headers;
};

/**
 * Generate a unique idempotency key
 * 
 * @param {string} prefix - Optional prefix for the key
 * @returns {string} Unique idempotency key
 */
const generateIdempotencyKey = (prefix = 'txn') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${prefix}_${timestamp}_${randomString}`;
};

/**
 * Makes API request with retry logic
 * 
 * @param {Function} apiCall - Async function that makes the API call
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} Result of the API call
 */
const withRetry = async (apiCall, maxRetries = MAX_RETRIES, delay = RETRY_DELAY_MS) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Only retry on network errors or 5xx server errors
      const shouldRetry = !error.response || (error.response?.status >= 500 && error.response?.status < 600);
      
      if (!shouldRetry || attempt === maxRetries) {
        break;
      }
      
      console.log(`API call failed. Retrying ${attempt + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1))); // Exponential backoff
    }
  }
  
  throw lastError;
};

/**
 * Validates payment amount
 * 
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code
 * @returns {boolean} True if valid, throws error if invalid
 */
const validateAmount = (amount, currency) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }
  
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  
  // Currency-specific validations
  if (currency === 'PHP') {
    if (amount < 100) { // Minimum amount for PHP is 100
      throw new Error('Minimum amount for PHP currency is 100');
    }
  }
  
  return true;
};

/**
 * Creates a payment intent
 * 
 * @param {number} amount - Payment amount in the currency's main unit (e.g., PHP, not cents)
 * @param {string} currency - Three-letter ISO currency code
 * @param {Array} paymentMethodTypes - Array of allowed payment method types
 * @param {Object} metadata - Additional metadata for the transaction
 * @returns {Promise<Object>} Payment intent data
 */
const createPaymentIntent = async (amount, currency, paymentMethodTypes, metadata = {}) => {
  // Validate inputs
  validateAmount(amount, currency);
  
  if (!Array.isArray(paymentMethodTypes) || paymentMethodTypes.length === 0) {
    throw new Error('Payment method types must be a non-empty array');
  }
  
  if (!currency || typeof currency !== 'string' || currency.length !== 3) {
    throw new Error('Currency must be a valid three-letter ISO currency code');
  }
  
  // Generate unique idempotency key for this request
  const idempotencyKey = generateIdempotencyKey('payment_intent');
  
  // Convert amount to cents (PayMongo uses smallest currency unit)
  const amountInSmallestUnit = Math.round(amount * 100);
  
  // Add transaction timestamp and ID to metadata
  const enhancedMetadata = {
    ...metadata,
    created_at: new Date().toISOString(),
    client_reference: idempotencyKey
  };
  
  return withRetry(async () => {
    const { data } = await axios.post('https://api.paymongo.com/v1/payment_intents', {
      data: {
        attributes: {
          amount: amountInSmallestUnit,
          currency,
          payment_method_allowed: paymentMethodTypes,
          payment_method_options: {},
          metadata: enhancedMetadata
        }
      }
    }, { headers: getHeaders(idempotencyKey) });
    
    return data;
  });
};

/**
 * Retrieves a payment intent by ID
 * 
 * @param {string} paymentIntentId - The ID of the payment intent to retrieve
 * @returns {Promise<Object>} Payment intent data
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    throw new Error('Payment intent ID is required');
  }
  
  return withRetry(async () => {
    const { data } = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`,
      { headers: getHeaders() }
    );
    
    return data;
  });
};

/**
 * Attaches a payment method to a payment intent
 * 
 * @param {string} paymentIntentId - The ID of the payment intent
 * @param {string} paymentMethodId - The ID of the payment method to attach
 * @returns {Promise<Object>} Updated payment intent data
 */
const attachPaymentMethod = async (paymentIntentId, paymentMethodId) => {
  if (!paymentIntentId || !paymentMethodId) {
    throw new Error('Payment intent ID and payment method ID are required');
  }
  
  const idempotencyKey = generateIdempotencyKey('attach_method');
  const returnUrl = process.env.PAYMENT_RETURN_URL || 'https://your-website.com/payment/success';
  
  return withRetry(async () => {
    const { data } = await axios.post(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethodId,
            return_url: returnUrl
          }
        }
      },
      { headers: getHeaders(idempotencyKey) }
    );
    
    return data;
  });
};

/**
 * Checks payment status and returns standardized status
 * 
 * @param {string} paymentIntentId - The ID of the payment intent to check
 * @returns {Promise<Object>} Standardized payment status information
 */
const checkPaymentStatus = async (paymentIntentId) => {
  const paymentData = await retrievePaymentIntent(paymentIntentId);
  const paymentIntent = paymentData.data;
  
  if (!paymentIntent) {
    throw new Error('Payment intent not found');
  }
  
  const { attributes } = paymentIntent;
  const { status, amount, currency, payment_method_allowed, updated_at, metadata = {} } = attributes;
  
  return {
    id: paymentIntent.id,
    status,
    amount: amount / 100, // Convert back to main currency unit
    currency,
    paymentMethod: payment_method_allowed,
    isSuccessful: status === 'succeeded',
    isPending: ['awaiting_payment_method', 'awaiting_next_action', 'processing'].includes(status),
    isFailed: ['failed', 'cancelled'].includes(status),
    lastUpdated: updated_at,
    metadata
  };
};

/**
 * Creates a payment source (for direct bank transfers)
 * 
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code
 * @param {string} type - Source type (e.g., 'gcash', 'grab_pay')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Payment source data
 */
const createPaymentSource = async (amount, currency, type, options = {}) => {
  validateAmount(amount, currency);
  
  if (!type || typeof type !== 'string') {
    throw new Error('Source type is required');
  }
  
  const idempotencyKey = generateIdempotencyKey('payment_source');
  const amountInSmallestUnit = Math.round(amount * 100);
  const { redirectSuccess = process.env.PAYMENT_SUCCESS_URL, redirectFailed = process.env.PAYMENT_FAILED_URL } = options;
  
  return withRetry(async () => {
    const { data } = await axios.post('https://api.paymongo.com/v1/sources', {
      data: {
        attributes: {
          amount: amountInSmallestUnit,
          currency,
          type,
          redirect: {
            success: redirectSuccess,
            failed: redirectFailed
          }
        }
      }
    }, { headers: getHeaders(idempotencyKey) });
    
    return data;
  });
};

// Named exports for better tree-shaking
export {
  createPaymentIntent,
  retrievePaymentIntent,
  attachPaymentMethod,
  checkPaymentStatus,
  createPaymentSource,
  generateIdempotencyKey
};