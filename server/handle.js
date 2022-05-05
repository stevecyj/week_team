const successHandler = (res, message, data = []) => {
    res.status(200).json({
        status: "success",
        message: message,
        data: data
    });
}

const errorHandler = (res, message, code = 400) => {
    res.status(code).json({
        status: "false",
        message: message
    });
}

module.exports = { successHandler, errorHandler };