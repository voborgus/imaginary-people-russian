import { useState } from "react";
import localFont from "next/font/local";
import DataSelector from "../components/DataSelector";
import GenderChart from "../components/GenderChart";
import AgeChart from "../components/AgeChart";
import ScheduleVisualization from "../components/ScheduleVisualization";
import {
  processData,
  Person,
  processScheduleData,
} from "../utils/dataProcessing";

import gemmaData from "../data/gemma_collated_responses.json";
import llamaData from "../data/llama3_8b_collated_responses.json";
import qwenData from "../data/qwen_collated_responses.json";
import ScrollableList from "@/components/ScrollableList";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});


export default function Home() {
  const [selectedData, setSelectedData] = useState("gemma");
  const data = selectedData === "gemma" 
    ? gemmaData 
    : selectedData === "llama" 
      ? llamaData
      : qwenData;
  const { genderData, ageData, nameData, locationData, jobData } = processData(
    data as Person[]
  );
  const scheduleData = processScheduleData(data as Person[]);

  return (
    <div
      className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)] p-8`}
    >
      <DataSelector
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
        <h1 className="text-3xl font-bold mt-16 mb-4">&quot;Imagine a person...&quot;</h1>
      <div className="mb-4 text-base max-w-[65ch]">
        <p className="text-lg mb-8">
          What happens when you ask an LLM to imagine a person, and what
          a random day in their life looks like, 100 times over?
        </p>
        <p>I asked Llama3.1 8b, Gemma2 2b & Qwen2.5 7b to imagine a person, a hundred times over, using the same prompt. The prompt asks for basic details, such as name, age, location and job title, then asks the AI to imagine a random day in that person's life.</p>
        <details className="my-2 mt-4 mb-4">

          <summary className="underline cursor-pointer">
            Click here to view the original prompt
          </summary>
          <pre className="text-white bg-slate-900 rounded-md py-3 px-4 mt-2">
            Imagine a person with the following details:
            <br />
            <br />
            Name
            <br />
            Gender
            <br />
            Age
            <br />
            Location (Country)
            <br />
            Brief backstory (1-2 sentences)
            <br />
            <br />
            Describe a random day from their life using this format:
            <br />
            <br />
            Time: [HH:MM]
            <br />
            Activity: [Brief description]
            <br />
            <br />
            Start with when they wake and end with when they go to sleep.
            Include as many time entries as possible, be very specific.
            <br />
            Example output:
            <br />
            <br />
            Name: [Name]
            <br />
            Gender: [Gender]
            <br />
            Age: [Age]
            <br />
            Location: [Country] <br />
            Backstory: [Brief backstory]
            <br />
            Day: <br />
            <br />
            Time: [HH:MM]
            <br />
            Activity: [Activity description]
            <br />
            (Repeat this format for each time entry)
          </pre>
        </details>
        <p>
          I processed the responses of the LLM with Claude Haiku to turn the result
          into a valid JSON files, also summarizing the activities of each
          person's day. Here's a visualisation of the results!
        </p>
        <p className="text-xl font-bold mt-8 mb-2">Caveats</p>
        <p>
          This is just for fun. These language models are running on my local
          machine, using quantized versions of the original models (llama3.1 8b
          Q4_0, gemma2 2b Q4_0, qwen2.5 7b Q4_K_M). I've set the temperature of my requests to 1.0.
          Using the original model, experimenting with temperature values or simply changing the prompt will hopefully provide more varied, creative responses. Qwen has been tuned to specialise in coding tasks, perhaps resulting in the following bias.
        </p>
      </div>
      <h2 className="text-2xl font-bold mb-2 mt-8">Age & Gender</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Gender Distribution</h3>
          <GenderChart data={genderData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Age Distribution</h3>
          <AgeChart data={ageData} />
        </div>
      </div>
      <div className="my-4 max-w-[65ch]">
      <ul className="list-disc pl-6 space-y-2">
        <li className="text-gray-800">
          Small LLMs seem to believe that only people between
          the ages of 25-35 exist.
        </li>
        <li className="text-gray-800">
          Llama3 only managed to imagine one human who was male - Akira Saito, a 32
          year old Japanese freelance graphic designer.
        </li>
        <li className="text-gray-800">
          No model was able to imagine a world outside the gender binary, at
          least in these first 100 responses.
        </li>
      </ul>
      </div>
      <h2 className="text-2xl font-bold mb-2 mt-8">Names, Locations, Jobs</h2>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollableList data={nameData} title="Name Distribution" />
          <ScrollableList data={locationData} title="Location Distribution" />
          <ScrollableList data={jobData} title="Job Distribution" />
          <ul className="list-disc pl-6 space-y-2">
            <li className="text-gray-800">
              The US models don't seem to acknowledge China exists. Qwen 2.5 takes a slightly different view.
            </li>
            <li className="text-gray-800">
              Llama imagines a third of the workforce as freelance graphic designers. Qwen knows that it's at least 80% software engineering. 
            </li>
            <li className="text-gray-800">
              I did a quick search and it turns out <a className="text-blue-600 hover:text-blue-800 underline" href="https://www.amazon.co.uk/stores/author/B0DFCPV6Z1?ingress=0&visitId=7dabcc37-e285-4d35-ba19-e81d65764888">Anya Petrova has an Amazon bookseller's page</a> with a lot of short stories and fantasy style cover art.
            </li>
          </ul>
          </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Random day visualizer</h2>
        <p>
          Each row represents a person&apos;s schedule for a random day in their
          life.
        </p>
        <p className="mb-4">
          You can click on a row to view the all the information for that person in an overview window, shown beneath the graph.
        </p>
        <ScheduleVisualization
          scheduleData={scheduleData}
          fullData={data as Person[]}
        />
      </div>
      <h2 className="text-2xl font-bold mb-2 mt-8">Similar work & next steps</h2>
      <p className="max-w-[65ch]">I stumbled upon a similar experiement investigating ChatGPT bias - <a className="text-blue-600 hover:text-blue-800 underline" href="https://github.com/timetospare/gpt-bias">timetospare / gpt-bias</a>. I'm afraid I'm otherwise not clued into the latest research in this space. I otherwise love the ability of using data visualisation to get a quick glance into the character of different models, within the context of a prompt - it would be awesome to see how much different prompts can create better, more diverse outputs.</p>
    </div>
  );
}
