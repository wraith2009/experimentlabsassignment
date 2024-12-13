import React, { useState } from "react";

interface AddEventModalProps {
  onClose: () => void;
  onSave: (event: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    desc?: string;
  }) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [desc, setDesc] = useState("");

  const handleSave = () => {
    if (title && start && end) {
      onSave({
        id: Math.random().toString(36).substr(2, 9), // Generate unique ID
        title,
        start,
        end,
        desc,
      });
      onClose();
    } else {
      alert("Please fill all required fields!");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Event</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          <input
            type="datetime-local"
            onChange={(e) => setStart(new Date(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          <input
            type="datetime-local"
            onChange={(e) => setEnd(new Date(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          <textarea
            placeholder="Event Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          ></textarea>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Save
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
