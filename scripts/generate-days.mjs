import fetch from "node-fetch";
import https from 'https';
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const NUM_REQUESTS = 100;
const OUTPUT_DIR = "llm_responses";
const PROMPT = `
Придумай человека со следующими данными:

Имя
Пол
Возраст
Местоположение (Страна)
Краткая предыстория (1-2 предложения)

Опишите случайный день из их жизни, используя следующий формат:

Время: [ЧЧ:ММ]
Занятие: [Краткое описание]

Начните с того момента, когда они просыпаются, и закончите тем, когда они ложатся спать. Включите как можно больше временных отметок, будьте очень конкретны.
Пример вывода:

Имя: [Имя]
Пол: [Пол]
Возраст: [Возраст]
Местоположение: [Страна]
Предыстория: [Краткая предыстория]
День:

Время: [ЧЧ:ММ]
Занятие: [Описание занятия]
(Повторите этот формат для каждой временной отметки)
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
//      model: "llama3.1:8b",
      model: "T-lite-instruct-0.1-abliterated.Q8_0:latest",
      prompt: prompt,
      stream: false,
      options: {
        seed: seed,
        temperature: TEMPERATURE,
      },
    }),
  });

  // Проверяем, что ответ от сервера был успешным
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  // Возвращаем текст ответа
  return await response.text();
}

const YANDEX_MODEL_URI = "gpt://[folder]/yandexgpt-lite";
const YANDEX_AUTH_HEADER = "Bearer [token]";
const YANDEX_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

async function sendYandexCloudRequest(prompt, seed) {
  try {
    const response = await fetch(YANDEX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": YANDEX_AUTH_HEADER
      },
      body: JSON.stringify({
        modelUri: YANDEX_MODEL_URI,
        completionOptions: {
          stream: false,
          temperature: TEMPERATURE,
          seed: seed
        },
        messages: [
          {
            role: "user",
            text: prompt
          }
        ]
      }),
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    console.log('Response body:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${responseText}`);
    }

    return responseText;
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    throw error;
  }
}

const SBER_AUTH_HEADER = "Bearer [token]"
const SBER_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
async function sendSberRequest(prompt, seed) {
  try {
    const response = await fetch(SBER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": SBER_AUTH_HEADER
      },
      body: JSON.stringify({
        model: "GigaChat",
          stream: false,
          seed: seed,
          top_p: 1,
        
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      }),
      agent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    console.log('Response body:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${responseText}`);
    }

    return responseText;
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    throw error;
  }
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

    for (let i = 17; i < NUM_REQUESTS; i++) {
      const seed = BASE_SEED + i * 10;
      const response = await sendRequest(PROMPT, seed);
      // const response = await sendYandexCloudRequest(PROMPT, seed);
      // const response = await sendSberRequest(PROMPT, seed);
      console.log(response); // Добавлено для отладки
      await saveResponse(response, i + 1);
      console.log(`Stored response ${i + 1} of ${NUM_REQUESTS}`);
    }

    console.log("All responses have been stored successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
