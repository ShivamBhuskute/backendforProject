// we're going to need to use async function
// for database again so instead we'll just
// make this utility file which can be reusable

const asyncHandler = () => (requestHandler) => {
    return (res, req, next) => {
        Promise.resolve(requestHandler(res, req, next)).catch((error) =>
            next(error)
        );
    };
};

// using a higher order function
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: true,
//             message: error.message
//         });
//     }
// }
export { asyncHandler };
