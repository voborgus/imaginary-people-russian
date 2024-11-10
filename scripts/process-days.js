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
"**Имя**: Ольга
**Пол**: женский
**Возраст**: 30 лет
**Местоположение**: Россия
**Предыстория**: Ольга работает врачом в местной больнице и помогает людям возвращаться к здоровой жизни после травм и болезней. Она также заботится о своей семье и находит время для увлечений, таких как рисование и чтение.

**День:**

Время: 07:00
Занятие: Ольга просыпается от звонка будильника. После завтрака она собирается на работу и выходит из дома в 07:30.

Время: 10:00–18:00
Занятость на работе: помогает пациентам, осматривает их и назначает лечение.

14:00 — обед: Ольга идёт в кафе рядом с больницей, чтобы перекусить.

 Время: 20:00 
 Занятие: после работы Ольга забирает детей из детского сада и идёт с ними домой. Дети рассказывают о своём дне в детском саду, а Ольга слушает их с интересом.

  Время:  21:00  
Забота о детях: она кормит детей ужином и помогает им с домашними заданиями. Перед сном дети обнимаются и рассказывают Ольге о своих чувствах и переживаниях за день. 
 
 Время:  22:00   
 Чтение книги:  Ольга ложится спать после того, как прочитала главу книги, которую давно хотела прочитать. Она засыпает, размышляя о том, как прошёл день и что ещё предстоит сделать на следующей неделе. "

Example output:
{
  "name": "Ольга",
  "gender": "Женский",
  "age": 30,
  "location": "Россия",
  "job": "Врач",
  "backstory": "Ольга работает врачом в местной больнице и помогает людям возвращаться к здоровой жизни после травм и болезней. Она также заботится о своей семье и находит время для увлечений, таких как рисование и чтение.",
  "schedule": [
    {
      "startTime": "00:00",
      "endTime": "07:00",
      "activities": ["сон"],
      "description": "Ночной сон"
    },
    {
      "startTime": "07:00",
      "endTime": "07:30",
      "activities": ["завтрак", "сбор на работу"],
      "description": "Затракает, собирается и выходит на работу"
    },
    {
      "startTime": "10:00",
      "endTime": "14:00",
      "activities": ["работа", "помощь пациентам"],
      "description": "Помогает пациентам, осматривает их и назначает лечение"
    },
    ...
  ]
}`;

async function processBatch(contents) {
  try {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Обрабатываем каждый файл отдельно, так как API не поддерживает настоящие батчи
    const results = await Promise.all(contents.map(async (content, index) => {
      await delay(index * 20000); // 1 секунда между запросами

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: content
        }]
      });

      return response?.content?.[0]?.text || "";
    }));

    return results;
  } catch (error) {
    console.error("Error in processBatch:", error);
    // Возвращаем массив пустых строк в случае ошибки
    return new Array(contents.length).fill("");
  }
}

async function main() {
  const inputDir = path.join(__dirname, "russian_gpt/llama31_8b_clean/");
  const outputDir = path.join(__dirname, "russian_gpt/llama31_8b_clean_json/");

  try {
    await fs.mkdir(outputDir, { recursive: true });
    const files = await fs.readdir(inputDir);
    const textFiles = files.filter(file => path.extname(file) === ".txt").slice(0, 100);

    for (let i = 0; i < textFiles.length; i += 10) {
      const batch = textFiles.slice(i, i + 10);
      console.log(`Processing batch ${i/10 + 1}...`);

      const contents = await Promise.all(
        batch.map(file => fs.readFile(path.join(inputDir, file), "utf-8"))
      );

      const processedContents = await processBatch(contents);

      // Записываем все файлы из батча
      await Promise.all(
        batch.map((file, index) => {
          const content = processedContents[index];
          if (content) {
            return fs.writeFile(
              path.join(outputDir, `processed_${file}`),
              content
            );
          }
        }).filter(Boolean)
      );

      console.log(`Batch ${i/10 + 1} completed`);
    }

    console.log("All files processed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}


main();
