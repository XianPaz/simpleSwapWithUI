const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "FrontEnd")));

app.listen(port, () => {
  console.log(`Frontend running at http://localhost:${port}`);
});