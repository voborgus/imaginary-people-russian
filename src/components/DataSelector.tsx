import React from "react";

interface DataSelectorProps {
  selectedData: string;
  setSelectedData: (data: string) => void;
}

const DataSelector: React.FC<DataSelectorProps> = ({
  selectedData,
  setSelectedData,
}) => {
  return (
    <select
      value={selectedData}
      onChange={(e) => setSelectedData(e.target.value)}
      className="p-2 border rounded-md fixed right-6"
    >
      <option value="gemma">Gemma2:2b</option>
      <option value="llama">Llama3.1:8b</option>
      <option value="qwen">Qwen2.5:7b</option>
    </select>
  );
};

export default DataSelector;
