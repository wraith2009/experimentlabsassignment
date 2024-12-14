import React, { useState, useEffect } from "react";

import { UserIdState } from "../../recoil/atom/auth.atoms";
import { useRecoilValue } from "recoil";
import { CalendarEvent } from "../../recoil/atom/event.atoms";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  existingEvent?: CalendarEvent | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingEvent,
}) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [desc, setDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userId = useRecoilValue(UserIdState);

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setStartDate(existingEvent.startDate);
      setEndDate(existingEvent.endDate);
      setDesc(existingEvent.description || "");
    } else {
      resetForm();
    }
    setIsLoading(false);
  }, [existingEvent, isOpen]);

  const resetForm = () => {
    setTitle("");
    setStartDate(null);
    setEndDate(null);
    setDesc("");
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 16);
  };

  const handleSave = async () => {
    if (!title || !startDate || !endDate || !desc) {
      alert("Please fill all required fields!");
      return;
    }

    if (startDate >= endDate) {
      alert("End time must be after start time!");
      return;
    }

    const eventData: CalendarEvent = {
      id: existingEvent?.id || "",
      title,
      startDate,
      endDate,
      description: desc || "",
      userId: userId || "",
    };

    if (eventData) {
      setIsLoading(true);
      try {
        await onSave(eventData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {existingEvent ? "Update Event" : "Add New Event"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Event Title
            </label>
            <input
              type="text"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(startDate)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(endDate)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter event description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isLoading}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isLoading
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading
              ? existingEvent
                ? "Updating..."
                : "Adding..."
              : existingEvent
              ? "Update Event"
              : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
