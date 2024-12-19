import express from "express";
const app = express();

// server and network port
const port = 8090; // 4000 to 10,000

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
