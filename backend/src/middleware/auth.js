import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check for token in cookies (if using cookies)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user to request
      req.user = { id: decoded.id };

      next();
    } catch (err) {
      return res.status(401).json({
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error in authentication",
    });
  }
};

// Middleware to check if user is manager
export const managerOnly = (req, res, next) => {
  // This would require fetching the user from database to check role
  // For now, we'll assume the protect middleware adds user info
  // In a real implementation, you'd fetch the user and check their role
  next();
};

// Middleware to check if user is health worker
export const healthWorkerOnly = (req, res, next) => {
  // This would require fetching the user from database to check role
  // For now, we'll assume the protect middleware adds user info
  // In a real implementation, you'd fetch the user and check their role
  next();
};