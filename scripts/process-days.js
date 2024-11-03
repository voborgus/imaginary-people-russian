const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs/promises");
const path = require("path");

const anthropic = new Anthropic({
  apiKey: "ADD_API_KEY_HERE",
});

const SYSTEM_PROMPT = `You are a precise JSON formatter. Your task is to take personal information and a daily schedule and convert it into a structured JSON object. The object should have the following structure:

{
  "name": "Full Name",
  "gender": "Gender",
  "age": Age,
  "location": "Country",
  "job": "Job",
  "backstory": "Brief backstory",
  "schedule": [
    {
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "activity": ["activity1", "activity2", "activity3", "activity4", "activity5"],
      "description": "Original description of the time block"
    }
  ]
}

Rules:
1. Extract personal information from the input text.
2. For the schedule array, follow these rules:
   a. Use 24-hour time format (00:00 to 23:59) for startTime and endTime.
   b. Include 1 to 5 activities undertaken during the time block, ordered by relevance.
   c. Time blocks should not overlap or duplicate.
   d. Cover the entire day from 00:00 to 23:59.
   e. If a time is not specified for the start of the day, assume 00:00. If a time is not specified for the end of the day, assume 23:59.
   f. If a sub-hour interval for a time block is given, e.g 0:00 - 0:15 or 0:15 - 0:45, this is recorded as a separate time block.
   g. Only include the first day's schedule if multiple days are provided.
3. Ensure all JSON is valid and can be parsed by JavaScript.
4. Return ONLY the JSON object, with no additional text or explanations.

Example input:
"Name: John Doe
Gender: Male
Age: 30
Location: Canada (Toronto)
Backstory: John moved to Toronto for work as an accounts manager and is adjusting to life in a new country.

Day:
6:00 AM - Wake up, brush teeth
7:00 AM - Breakfast and coffee
8:00 AM - Commute to work
9:00 AM - Start workday
12:00 PM - Lunch break
1:00 PM - Afternoon meetings
5:00 PM - Leave work, go to gym
7:00 PM - Dinner and relaxation
10:00 PM - Bedtime routine
11:00 PM - Sleep"

Example output:
{
  "name": "John Doe",
  "gender": "Male",
  "age": 30,
  "location": "Canada",
  "job": "Accounts Manager",
  "backstory": "John moved to Toronto for work as an accounts manager and is adjusting to life in a new country.",
  "schedule": [
    {
      "startTime": "00:00",
      "endTime": "06:00",
      "activities": ["sleep"],
      "description": "Sleeping through the night"
    },
    {
      "startTime": "06:00",
      "endTime": "07:00",
      "activities": ["morning routine", "brush teeth"],
      "description": "Wake up, brush teeth"
    },
    {
      "startTime": "07:00",
      "endTime": "08:00",
      "activities": ["breakfast", "coffee"],
      "description": "Breakfast and coffee"
    },
    ...
  ]
}`;

async function processLLMResponse(content) {
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    },
  ];

  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: messages,
  });

  return response.content[0].text;
}

async function main() {
  const inputDir = path.join(__dirname, "qwen2.5_llm_responses");
  const outputDir = path.join(__dirname, "processed_responses");

  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Read all files in the input directory
    const files = await fs.readdir(inputDir);

    for (let i = 0; i < 100; i++) {
      const file = files[i];
      if (path.extname(file) === ".txt") {
        console.log(`Processing ${file}...`);

        // Read the input file
        const inputPath = path.join(inputDir, file);
        const inputContent = await fs.readFile(inputPath, "utf-8");

        // Process the LLM response
        const processedContent = await processLLMResponse(inputContent);

        // Write the processed content to a new file
        const outputPath = path.join(outputDir, `processed_${file}`);
        await fs.writeFile(outputPath, processedContent);

        console.log(`Processed ${file} and saved as processed_${file}`);
      }
    }

    console.log("All files processed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
