/**
 * Formats amount to the correct format for display
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code
 * @returns {string} The formatted amount
 */
export const formatAmount = (amount, currency = 'PHP') => {
    const formatter = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
  };
  
  /**
   * Validates if payment is successful
   * @param {Object} paymentStatus - The payment status object
   * @returns {boolean} Whether the payment is valid
   */
  export const isValidPayment = (paymentStatus) => {
    return paymentStatus.isSuccessful && !paymentStatus.isFailed;
  };
  
  /**
   * Converts payment status to user-friendly message
   * @param {Object} paymentStatus - The payment status object
   * @returns {Object} User-friendly status message
   */
  export const getStatusMessage = (paymentStatus) => {
    const statusMap = {
      'succeeded': {
        message: 'Payment successful',
        type: 'success'
      },
      'awaiting_payment_method': {
        message: 'Waiting for payment method',
        type: 'info'
      },
      'awaiting_next_action': {
        message: 'Additional action required',
        type: 'info'
      },
      'processing': {
        message: 'Payment processing',
        type: 'info'
      },
      'failed': {
        message: 'Payment failed',
        type: 'error'
      },
      'cancelled': {
        message: 'Payment cancelled',
        type: 'warning'
      }
    };
    
    return statusMap[paymentStatus.status] || {
      message: 'Unknown payment status',
      type: 'warning'
    };
  };
  
  /**
   * Generates a tracking ID for a payment
   * @param {string} prefix - The prefix for the tracking ID
   * @returns {string} The generated tracking ID
   */
  export const generateTrackingId = (prefix = 'PAY') => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
  };