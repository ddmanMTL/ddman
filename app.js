const express = require("express");
const cors = require("cors");
const serveStatic = require("serve-static");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/", serveStatic(__dirname));

const { createCanvas } = require("canvas");
const Image = createCanvas.Image;

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push({ text: line, y: y });
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  lines.push({ text: line, y: y });
  return lines;
}

app.post("/api/orders", (req, res) => {
  console.log("Received order:", req.body);

  const packages = req.body.packages;
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 800, 600);

  const sectionWidth = 800 / packages.length;

  packages.forEach((package, index) => {
    ctx.fillStyle = "black";
    ctx.font = "24px sans-serif";

    const sectionStart = sectionWidth * index;
    ctx.fillText("Package " + (index + 1), sectionStart + 10, 30);

    let productYOffset = 0;

    package.forEach((product, productIndex) => {
      const wrappedLines = wrapText(
        ctx,
        product.name + " - $" + product.price,
        sectionStart + 15,
        75 + productYOffset,
        sectionWidth - 40,
        30
      );

      const boxHeight = wrappedLines.length * 30 + 10;
      ctx.beginPath();
      ctx.rect(sectionStart + 10, 60 + productYOffset, sectionWidth - 20, boxHeight);
      ctx.stroke();

      wrappedLines.forEach(line => {
        ctx.fillText(line.text, sectionStart + 15, line.y);
      });

      productYOffset += boxHeight + 10;
    });
  });

  console.log("Saving image to disk");
  const stream = canvas.createPNGStream();
  const fs = require("fs");
  const filename = "cart.png";
  const fileStream = fs.createWriteStream(filename);

  stream.pipe(fileStream);

  fileStream.on("finish", () => {
    console.log("Image saved successfully");
    res.status(201).send("Order created and image generated");
  });

  fileStream.on("error", (err) => {
    console.error("Error saving image:", err);
    console.log("Error object:", err);
    res.status(500).send("Error: Unable to save image.");
  });
});

app.get("/api/orders/image", (req, res) => {
  const fs = require("fs");
  const filename = "cart.png";
  if (fs.existsSync(filename)) {
    res.sendFile(filename, { root: __dirname });
  } else {
    res.status(404).send("Image not found.");
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
