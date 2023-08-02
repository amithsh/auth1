const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
  try {

    const token = request.headers.authorization.split(" ")[1]

    const decoded = await jwt.verify(
        token,
        "secret-Key"
    )

    const user = decoded

    request.user = user

    next();
  } catch (error) {
    response.status(401).send({
      message: "invalid request",
      error,
    });
  }
};
