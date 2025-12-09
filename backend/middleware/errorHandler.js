/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - ERROR HANDLER MIDDLEWARE
 * Centralized error handling, logging, and response formatting
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests', 429, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment required') {
    super(message, 402, 'PAYMENT_REQUIRED');
  }
}

export class PlanLimitError extends AppError {
  constructor(feature, currentPlan, requiredPlan) {
    super(`${feature} requires ${requiredPlan} plan or higher`, 403, 'PLAN_LIMIT');
    this.feature = feature;
    this.currentPlan = currentPlan;
    this.requiredPlan = requiredPlan;
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, originalError = null) {
    super(`External service error: ${service}`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * Error logging utility
 */
const logError = (error, req) => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    },
    user: req.user ? {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      orgId: req.user.orgId
    } : null
  };
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., Datadog, Sentry, CloudWatch)
    console.error(JSON.stringify(logData));
  } else {
    console.error('═══════════════════════════════════════════════════════════════════════════════');
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
    console.error('Request:', req.method, req.originalUrl);
    console.error('═══════════════════════════════════════════════════════════════════════════════');
  }
  
  return logData;
};

/**
 * Format error response
 */
const formatErrorResponse = (error, req) => {
  const response = {
    success: false,
    error: error.message
  };
  
  // Add error code if present
  if (error.code) {
    response.code = error.code;
  }
  
  // Add validation fields if present
  if (error.fields && error.fields.length > 0) {
    response.fields = error.fields;
  }
  
  // Add retry-after for rate limits
  if (error.retryAfter) {
    response.retryAfter = error.retryAfter;
  }
  
  // Add plan info for plan limit errors
  if (error.feature) {
    response.feature = error.feature;
    response.currentPlan = error.currentPlan;
    response.requiredPlan = error.requiredPlan;
    response.upgradeUrl = '/billing/upgrade';
  }
  
  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = error.stack;
  }
  
  // Add request ID for tracking
  response.requestId = req.id || req.headers['x-request-id'] || crypto.randomUUID?.() || Date.now().toString();
  
  return response;
};

/**
 * Handle specific error types
 */
const handleSpecificErrors = (error) => {
  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('File size exceeds maximum limit');
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('Unexpected file field');
  }
  
  // MongoDB/Database errors
  if (error.code === 11000) {
    return new ConflictError('Duplicate entry exists');
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  
  // Stripe errors
  if (error.type === 'StripeCardError') {
    return new PaymentError(error.message);
  }
  
  if (error.type === 'StripeInvalidRequestError') {
    return new ValidationError(error.message);
  }
  
  return error;
};

/**
 * Main error handler middleware
 */
export const errorHandler = (error, req, res, next) => {
  // Handle specific error types
  const processedError = handleSpecificErrors(error);
  
  // Determine status code
  let statusCode = processedError.statusCode || 500;
  
  // Log the error
  logError(processedError, req);
  
  // Don't leak internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    processedError.message = 'An unexpected error occurred';
  }
  
  // Format and send response
  const response = formatErrorResponse(processedError, req);
  
  // Set retry-after header for rate limits
  if (processedError.retryAfter) {
    res.setHeader('Retry-After', processedError.retryAfter);
  }
  
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Endpoint');
  error.message = `Endpoint not found: ${req.method} ${req.originalUrl}`;
  next(error);
};

/**
 * Async handler wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request validation helper
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body, 'body');
      errors.push(...bodyErrors);
    }
    
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query, 'query');
      errors.push(...queryErrors);
    }
    
    if (schema.params) {
      const paramErrors = validateObject(req.params, schema.params, 'params');
      errors.push(...paramErrors);
    }
    
    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }
    
    next();
  };
};

/**
 * Simple object validator
 */
const validateObject = (data, schema, location) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: `${location}.${field}`,
        message: `${field} is required`
      });
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} must be a ${rules.type}`
        });
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} must be at least ${rules.minLength} characters`
        });
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} must not exceed ${rules.maxLength} characters`
        });
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          field: `${location}.${field}`,
          message: rules.patternMessage || `${field} format is invalid`
        });
      }
      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field: `${location}.${field}`,
          message: `${field} must be one of: ${rules.enum.join(', ')}`
        });
      }
    }
  }
  
  return errors;
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validate,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  PaymentError,
  PlanLimitError,
  ExternalServiceError
};
