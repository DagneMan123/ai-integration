class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}

const successResponse = (statusCode = 200, data = null, message = 'Success') => {
  return new ApiResponse(statusCode, data, message);
};

const errorResponse = (statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = new ApiResponse(statusCode, null, message);
  if (errors) response.errors = errors;
  return response;
};

const paginatedResponse = (statusCode = 200, data = [], total = 0, page = 1, limit = 10, message = 'Success') => {
  const response = new ApiResponse(statusCode, data, message);
  response.pagination = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasMore: page < Math.ceil(total / limit)
  };
  return response;
};

const sendResponse = (res, statusCode = 200, data = null, message = 'Success') => {
  res.status(statusCode).json(successResponse(statusCode, data, message));
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  res.status(statusCode).json(errorResponse(statusCode, message, errors));
};

module.exports = {
  ApiResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
  sendResponse,
  sendError
};
