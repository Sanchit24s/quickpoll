const express = require("express");
const authRouter = require("./authRoutes");
const pollRouter = require("./pollRoutes");
const router = express.Router();


router.use("/auth", authRouter);
router.use("/poll", pollRouter);

module.exports = router;