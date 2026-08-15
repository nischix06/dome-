const express = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/role");


const router = express.Router();


router.get(
    "/test",
    authenticate,
    requireRole("government"),
    (req, res) => {
        res.json({
            message: "Government access granted",
            user: req.user
        });
    }
);


module.exports = router;
