// for any error that may accur also we have 
// inherited from "Error" which is inbuilt

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        statck = "") {
        super(message)
        this.statusCode = statusCode,
            this.data = null,
            this.message = message,
            this.success = false,
            this.errors = errors

    }
}

export { ApiError }