import express from "express";
import { hostsRoute } from "./router/hosts.js";

const PORT = 3000;

const app = express();

app.use("/hosts", hostsRoute);

app.listen(PORT, () => {
  console.log(`Listening http://localhost:${PORT}`);
});
