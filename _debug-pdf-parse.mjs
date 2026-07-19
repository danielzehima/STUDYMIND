import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const buffer = await readFile(
  "C:/Users/HP/AppData/Local/Temp/claude/C--Users-HP-Desktop-agent-ai/26db50d7-ac56-42fb-82db-208925a88a9a/scratchpad/real-test.pdf"
);

try {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  console.log("SUCCESS, length:", result.text.length);
  console.log("excerpt:", JSON.stringify(result.text.slice(0, 200)));
} catch (error) {
  console.log("FAILURE");
  console.error(error);
}
