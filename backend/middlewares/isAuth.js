import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token || typeof token !== "string") {
            return res.status(401).json({
                message: "Unauthorized - token missing",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized - invalid token",
        });
    }
};

export default isAuth;