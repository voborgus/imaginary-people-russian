import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const NUM_REQUESTS = 100;
const OUTPUT_DIR = "llm_responses";
const PROMPT = `
Imagine a person with the following details:

Name
Gender
Age
Location (Country)
Brief backstory (1-2 sentences)

Describe a random day from their life using this format:

Time: [HH:MM]
Activity: [Brief description]

Start with when they wake and end with when they go to sleep. Include as many time entries as possible, be very specific.
Example output:

Name: [Name]
Gender: [Gender]
Age: [Age]
Location: [Country]
Backstory: [Brief backstory]
Day:

Time: [HH:MM]
Activity: [Activity description]
(Repeat this format for each time entry)
`;
const BASE_SEED = 10;
const TEMPERATURE = 1.0;

async function sendRequest(prompt, seed) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "phi3.5",
      prompt: prompt,
      stream: false,
      options: {
        seed: seed,
        temperature: TEMPERATURE,
      },
    }),
  });
  return await response.json();
}

async function saveResponse(response, index) {
  const fileName = `response_${index.toString().padStart(3, "0")}.txt`;
  const filePath = path.join(__dirname, OUTPUT_DIR, fileName);
  await fs.writeFile(filePath, response);
}

async function main() {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, OUTPUT_DIR), { recursive: true });

    for (let i = 0; i < NUM_REQUESTS; i++) {
      const seed = BASE_SEED + i * 10;
      const response = await sendRequest(PROMPT, seed);
      await saveResponse(response.response, i + 1);
      console.log(`Stored response ${i + 1} of ${NUM_REQUESTS}`);
    }

    console.log("All responses have been stored successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
