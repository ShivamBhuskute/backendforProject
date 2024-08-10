import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken;
        const refreshToken = user.generateRefreshToken;

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Error while generating refresh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "ok",
    // });
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images AND avatar
    // upload them to cloudinary
    // create user object(NoSql database so creating object) - entry in db
    // remove password & refresh token from response
    // check for user creation
    // return response

    const { fullname, email, username, password } = req.body;

    console.log("email", email);

    // if (fullname === "") {
    //   throw new ApiError(400, "Fullname is required");
    // }

    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (avatarLocalPath) {
        throw new ApiError(400, "avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const coverImage = coverImageLocalPath
        ? await uploadonCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError(400, "avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // req user data from database, req body -> data
    // username or email
    // find the user
    // passoword check
    // generate access & refresh
    // send cookies
    // success res

    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username and passowrd is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "USer does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return (
        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                })
            ),
        "User logged in successfully"
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized req");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = User.findById(decodedToken?._id);

        if (!user) throw new ApiError(401, "invalide refresh token");

        if (incomingRefreshToken !== user?.refreshToken)
            throw new ApiError(401, " refresh token is expired or used");

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", newRefreshToken)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Passwird changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fetched successfullt");
});

const updateAccDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) throw new ApiError(400, "All fields are req");

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Acc details updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalpath = req.files?.path;

    if (!coverLocalpath) throw new ApiError(400, "Cover image file is missing");

    const coverImage = await uploadOnCloudinary(coverLocalpath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover");
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { mew: true }
    ).select("=password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "CoverImage uodated suuccessfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalpath = req.files?.path;

    if (!avatarLocalpath) throw new ApiError(400, "Avatar file is missing");

    const avatar = await uploadOnCloudinary(avatarLocalpath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { mew: true }
    ).select("=password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar uodated suuccessfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentUserPassword,
    updateAccDetails,
    updateUserAvatar,
    updateUserCoverImage,
};
