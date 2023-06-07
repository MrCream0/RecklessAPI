const jwt = require("jsonwebtoken");

const auth = (request, response, next) => {
    const token = request.header("Authorization");
    if (!token) {
        return response.status(401).json({ message: "Authorization denied" });
    }

    try {
        const verified = jwt.verify(token, "secret");
        request.user = verified;
        next();
    } catch (error) {
        response.status(400).json({ message: "Invalid token" });
    }
}

module.exports = auth;