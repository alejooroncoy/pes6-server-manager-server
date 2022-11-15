import { parse } from "yaml";
import express from "express";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const app = express();

const hostsRoute = express.Router();

const dbHostsServerPes6 = path.resolve("db-hosts-server-pes6");

hostsRoute.use("/static", express.static(dbHostsServerPes6));

hostsRoute.get("/list", async (_, res) => {
  const hostsName = await readdir(dbHostsServerPes6, "utf-8");
  const hosts = await Promise.all(
    hostsName.map(async (hostName) => {
      const pathConfigHostName = path.resolve(
        dbHostsServerPes6,
        `./${hostName}`,
        "config.yml"
      );
      const contentConfig = await readFile(pathConfigHostName, "utf-8");
      const config = parse(contentConfig);
      return {
        ...config,
        description: config.description.trim(),
      };
    })
  );
  return res.json(hosts);
});

app.use("/hosts", hostsRoute);

app.listen(3000, () => {
  console.log(`Listening http://localhost:3000`);
});
