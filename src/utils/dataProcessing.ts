export interface Person {
  data: {
    gender: string;
    age: number;
    name: string;
    location: string;
    job: string;
    backstory: string;
    schedule: ScheduleItem[];
  };
}

interface ScheduleItem {
  startTime: string;
  endTime: string;
  activities: string[];
  description: string;
}

export interface ProcessedScheduleData {
  activities: { [key: string]: number };
  schedules: {
    id: number;
    schedule: {
      startTime: number;
      endTime: number;
      activities: string[];
    }[];
  }[];
}

interface ProcessedData {
  genderData: { name: string; value: number }[];
  ageData: { age: number; count: number }[];
  nameData: { [key: string]: number };
  locationData: { [key: string]: number };
  jobData: { [key: string]: number };
}

export function processData(data: Person[]): ProcessedData {
  const genderCount: { [key: string]: number } = { Male: 0, Female: 0, Other: 0 };
  const ageCount: { [key: number]: number } = {};
  const nameCount: { [key: string]: number } = {};
  const locationCount: { [key: string]: number } = {};
  const jobCount: { [key: string]: number } = {};

  data.forEach((person) => {
    // Process gender and age (unchanged)
    const gender = person.data.gender;
    if (gender in genderCount) {
      genderCount[gender]++;
    } else {
      genderCount.Other++;
    }

    const age = person.data.age;
    ageCount[age] = (ageCount[age] || 0) + 1;

    // Process name, location, and job
    const { name, location, job } = person.data;
    nameCount[name] = (nameCount[name] || 0) + 1;
    locationCount[location] = (locationCount[location] || 0) + 1;
    jobCount[job] = (jobCount[job] || 0) + 1;
  });

  const genderData = Object.entries(genderCount).map(([name, value]) => ({ name, value }));
  const ageData = Object.entries(ageCount).map(([age, count]) => ({ age: parseInt(age), count }));

  return { genderData, ageData, nameData: nameCount, locationData: locationCount, jobData: jobCount };
}

export function prepareWordCloudData(data: { [key: string]: number }): { text: string; value: number }[] {
  const words: { [key: string]: number } = {};

  Object.entries(data).forEach(([key, value]) => {
    const word = key;
    words[word] = (words[word] || 0) + value;
  });

  return Object.entries(words)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);  // Limit to top 100 words for better performance
}


export function processScheduleData(data: Person[]): ProcessedScheduleData {
  const activities: { [key: string]: number } = {};
  const schedules: ProcessedScheduleData['schedules'] = [];

  data.forEach((person, index) => {
    const personSchedule: ProcessedScheduleData['schedules'][0]['schedule'] = [];

    // Sort the schedule items by start time
    const sortedSchedule = person.data.schedule.sort((a, b) =>
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    let currentTime = 0; // Start of the day (00:00)

    sortedSchedule.forEach((item: ScheduleItem, itemIndex) => {
      const startTime = timeToMinutes(item.startTime);
      let endTime = timeToMinutes(item.endTime);

      // If this is not the first item and there's a gap, add a sleep entry
      if (startTime > currentTime) {
        personSchedule.push({
          startTime: currentTime,
          endTime: startTime,
          activities: ['sleep']
        });
        activities['sleep'] = (activities['sleep'] || 0) + (startTime - currentTime);
      }

      // If this is the last item, extend it to midnight if it doesn't already end at midnight
      if (itemIndex === sortedSchedule.length - 1 && endTime < 1440) {
        endTime = 1440; // 24:00
      }
      // For all other items, if the end time is past midnight, curtail it to midnight
      else if (endTime > 1440) {
        endTime = 1440; // 24:00
      }

      personSchedule.push({ startTime, endTime, activities: item.activities });

      item.activities.forEach(activity => {
        activities[activity] = (activities[activity] || 0) + (endTime - startTime);
      });

      currentTime = endTime;
    });

    // If the schedule is empty, fill the entire day with sleep
    if (personSchedule.length === 0) {
      personSchedule.push({
        startTime: 0,
        endTime: 1440,
        activities: ['sleep']
      });
      activities['sleep'] = (activities['sleep'] || 0) + 1440;
    }

    schedules.push({ id: index, schedule: personSchedule });
  });

  return { activities, schedules };
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
