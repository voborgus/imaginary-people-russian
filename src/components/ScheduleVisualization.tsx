import React, { useState } from "react";
import { ProcessedScheduleData, Person } from "../utils/dataProcessing";

interface ScheduleVisualizationProps {
  scheduleData: ProcessedScheduleData;
  fullData: Person[];
}

const ScheduleVisualization: React.FC<ScheduleVisualizationProps> = ({
  scheduleData,
  fullData,
}) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const totalMinutes = scheduleData.schedules.length * 24 * 60;
  const getActivityPercentage = (activity: string) =>
    ((scheduleData.activities[activity] || 0) / totalMinutes) * 100;

  const sortedActivities = Object.entries(scheduleData.activities)
    .sort(([, a], [, b]) => (sortOrder === "desc" ? b - a : a - b))
    .map(([activity]) => activity);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Занятия</h2>
          <button
            onClick={toggleSortOrder}
            className="mb-2 px-2 py-1 bg-blue-500 text-white rounded"
          >
            Сортировка {sortOrder === "desc" ? "↓" : "↑"}
          </button>
          <button
            onClick={() => setSelectedActivities([])}
            className="ml-2 px-2 py-1 bg-gray-500 text-white rounded"
          >
            Очистить выбор
          </button>
          <div className="h-[550px] overflow-y-auto">
            {sortedActivities.map((activity) => (
              <div key={activity} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={activity}
                  checked={selectedActivities.includes(activity)}
                  onChange={() => toggleActivity(activity)}
                  className="mr-2"
                />
                <label htmlFor={activity}>
                  {activity} ({getActivityPercentage(activity).toFixed(2)}%)
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Расписание</h2>
          <div className="h-[600px] overflow-y-auto">
            {scheduleData.schedules.map(({ id, schedule }) => (
              <div
                key={id}
                className="h-[6px] flex cursor-pointer"
                onClick={() => setSelectedPerson(id)}
              >
                {schedule.map(({ startTime, endTime, activities }, index) => {
                  const width = ((endTime - startTime) / (24 * 60)) * 100;
                  const showSegment =
                    selectedActivities.length === 0 ||
                    activities.some((a) => selectedActivities.includes(a));
                  return (
                    <div
                      key={index}
                      style={{
                        width: `${width}%`,
                        backgroundColor: showSegment
                          ? getActivityColor(activities[0])
                          : "white",
                      }}
                      className="h-full"
                      title={`${activities.join(", ")} (${minutesToTime(
                        startTime
                      )} - ${minutesToTime(endTime)})`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedPerson !== null && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {fullData[selectedPerson].data.name}
              </h2>
              <p>
                <strong>Возраст:</strong> {fullData[selectedPerson].data.age}
              </p>
              <p>
                <strong>Пол:</strong> {fullData[selectedPerson].data.gender}
              </p>
              <p>
                <strong>Локация:</strong>{" "}
                {fullData[selectedPerson].data.location}
              </p>
              <p>
                <strong>Работа:</strong> {fullData[selectedPerson].data.job}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 ">Предыстория</h3>
              <p>{fullData[selectedPerson].data.backstory}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Расписание</h3>
            <div className="space-y-2">
              {fullData[selectedPerson].data.schedule.map((item, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded">
                  <div className="flex items-center mb-1">
                    <div className="w-32">
                      {item.startTime} - {item.endTime}
                    </div>
                    <div
                      className="w-4 h-4 mx-2"
                      style={{
                        backgroundColor: getActivityColor(item.activities[0]),
                      }}
                    />
                    <div>
                      <strong>{item.activities.join(", ")}</strong>
                    </div>
                  </div>
                  <p className="text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getActivityColor(activity: string): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F06292",
    "#AED581",
    "#7986CB",
    "#4DD0E1",
    "#DCE775",
  ];
  return colors[
    Math.abs(
      activity.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length
  ];
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

export default ScheduleVisualization;
