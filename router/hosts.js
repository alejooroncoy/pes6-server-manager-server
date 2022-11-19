import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createWriteStream, existsSync } from "node:fs";
import { parse } from "yaml";
import express from "express";
import exe from "@angablue/exe";

export const hostsRoute = express.Router();

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

const pathDistPsm = path.resolve("./dist");
const psmPathJsFile = path.resolve(pathDistPsm, "./psm.js");

hostsRoute.get("/psm-bin", (req, res) => {
  if (req.query.os === "windows") {
    const psmCliExe = path.resolve(pathDistPsm, "./bin/psm-bin.exe");
    console.log(!existsSync(pathDistPsm), !existsSync(psmCliExe));
    if (!existsSync(pathDistPsm) || !existsSync(psmCliExe))
      return res.status(404).json({
        message: "There isn't psm-bin file",
      });
    res.download(psmCliExe, (err) => {
      if (err)
        return res.status(500).json({
          message: `Error: ${err}`,
        });
    });
  }
});

hostsRoute.post("/psm-bin", async (req, res) => {
  if (!existsSync(pathDistPsm)) await mkdir(pathDistPsm);
  const distBinStream = createWriteStream(psmPathJsFile, "utf-8");
  req.pipe(distBinStream);
  distBinStream.on("close", async () => {
    await exe({
      entry: psmPathJsFile,
      out: "./dist/bin/psm-bin.exe",
      pkg: ["--compress", "GZip"],
      version: req.query.version,
      target: "latest-win-x64",
      icon: "./assets/logo-psm.ico",
      properties: {
        CompanyName: req.query.company,
        ProductName: "PSM Bin",
        FileDescription: "Pes6 server manager version Bin. 💻⚽",
        LegalCopyright: "Copyright © PSM-Team MIT License",
      },
    });
    console.log("PSM Bin loaded");
    res.status(200).json({
      status: "success",
    });
  });
});
