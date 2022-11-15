import express from "express";
import { readdir } from "node:fs/promises";
import path from "node:path";

const app = express();

const hostsRoute = express.Router();

const dbHostsServerPes6 = path.resolve("db-hosts-server-pes6");

hostsRoute.use("/static", express.static(dbHostsServerPes6));

hostsRoute.get("/list", async (_, res) => {
  const hostsName = await readdir(dbHostsServerPes6, "utf-8");
  return res.json(hostsName);
});

app.use("/hosts", hostsRoute);

app.listen(3000, () => {
  console.log(`Listening http://localhost:3000`);
});
