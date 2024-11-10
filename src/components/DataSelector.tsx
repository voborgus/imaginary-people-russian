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
      <option value="yandexGPT">YandexGPT Lite 22.05.2024</option>
      <option value="llama">Llama3.1:8b</option>
      <option value="giga">GigaChat Lite:1.0.26.15</option>
      <option value="tlite">T-lite-instruct-0.1-abliterated.Q8_0</option>
    </select>
  );
};

export default DataSelector;
; 