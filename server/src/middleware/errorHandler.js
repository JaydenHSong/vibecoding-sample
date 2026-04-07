// Global error handler — catches unhandled errors from async route handlers
const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ error: '이미 존재하는 데이터입니다' });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: '유효하지 않은 ID입니다' });
  }

  res.status(err.status || 500).json({ error: '서버 오류가 발생했습니다' });
};

module.exports = errorHandler;
