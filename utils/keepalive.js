const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(200).json({ 
    status: "success", 
    message: "Server is awake",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
