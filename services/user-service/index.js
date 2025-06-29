const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello from Auth Service!");
});

app.listen(PORT, () => {
  console.log(`User service running on http://localhost:${PORT}`);
});
