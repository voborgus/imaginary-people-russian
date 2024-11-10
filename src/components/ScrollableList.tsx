import React, { useState } from "react";

interface ScrollableListProps {
  data: { [key: string]: number };
  title: string;
}

const ScrollableList: React.FC<ScrollableListProps> = ({ data, title }) => {
  const [sortOrder, setSortOrder] = useState<"most" | "least">("most");

  const sortedData = Object.entries(data).sort(([, a], [, b]) =>
    sortOrder === "most" ? b - a : a - b
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="mb-2">
        <button
          className={`mr-2 px-2 py-1 rounded ${
            sortOrder === "most" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSortOrder("most")}
        >
          Популярные
        </button>
        <button
          className={`px-2 py-1 rounded ${
            sortOrder === "least" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSortOrder("least")}
        >
          Редкие
        </button>
      </div>
      <div className="h-[400px] overflow-y-auto">
        {sortedData.map(([key, value]) => (
          <div key={key} className="flex justify-between py-1 border-b">
            <span>{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollableList;
