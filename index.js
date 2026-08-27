import { ChemicalServer } from "chemicaljs";
import express from "express";
import { execSync } from "node:child_process";
import fs from "node:fs";

if (!fs.existsSync("dist")) {
    console.log("No build folder found. Building...");
    execSync("pnpm run build", { stdio: "inherit" });
    console.log("Built!");
}

const [app, listen] = new ChemicalServer({
    uv: true,
    scramjet: false,
    rammerhead: false,
});

console.log("Chemical server created");

const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");

// Log every normal HTTP request
app.use((req, res, next) => {
    console.log("HTTP:", req.method, req.url);
    next();
});

// Serve your built frontend
app.use(
    express.static("dist", {
        index: "index.html",
        extensions: ["html"],
    }),
);

// Install Chemical routes, including /wisp/
app.serveChemical();

console.log("Chemical routes installed");

// SPA fallback
app.use((req, res) => {
    res.status(404);
    res.sendFile("dist/index.html", { root: "." });
});

listen(port, "0.0.0.0", () => {
    console.log(`nano is listening on port ${port}`);
});