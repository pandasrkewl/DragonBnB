const fs = require("fs");
const path = require("path");

test("property image uploads use Vercel Blob instead of local disk storage", () => {
  const serverCode = fs.readFileSync(
    path.join(__dirname, "../server.js"),
    "utf8",
  );

  expect(serverCode).toContain('@vercel/blob');
  expect(serverCode).toContain("multer.memoryStorage()");
  expect(serverCode).toContain("await put(");
  expect(serverCode).not.toContain("multer.diskStorage");
});
