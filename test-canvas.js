const { createCanvas } = require("canvas");

const canvas = createCanvas(200, 200);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, 200, 200);

const fs = require("fs");
const filename = "test-canvas.png";
const out = fs.createWriteStream(filename);
const stream = canvas.createPNGStream();

stream.pipe(out);
out.on("finish", () => {
  console.log("The PNG file was created:", filename);
});
