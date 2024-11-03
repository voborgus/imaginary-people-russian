const fs = require("fs").promises;
const path = require("path");

async function collateJsonFiles() {
  const inputDir = path.join(__dirname, "processed_responses");
  const outputFile = path.join(__dirname, "collated_responses.json");

  try {
    const files = await fs.readdir(inputDir);
    const jsonFiles = files.filter((file) => path.extname(file) === ".txt");

    const collatedData = [];

    for (let i = 0; i < jsonFiles.length; i++) {
      const file = jsonFiles[i];
      const filePath = path.join(inputDir, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      console.log(i);
      const jsonData = JSON.parse(fileContent);

      collatedData.push({
        filename: file,
        data: jsonData,
      });
    }

    await fs.writeFile(outputFile, JSON.stringify(collatedData, null, 2));
    console.log(`Collated data written to ${outputFile}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

collateJsonFiles();
