// we're going to need to use async function 
// for database again so instead we'll just
// make this utility file which can be reusable





// const asyncHandler = () => { requestHandler } => {
//     (res, req, next) => {
//         Promise.resolve(requestHandler(res, req, next)).catch((err) => next(err))
//     }
// }



// using a higher order function
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(err.code || 500).json({
            success: true,
            message: err.message
        });
    }
}
export { asyncHandler }