import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AddEventModal from "./AddEventModal";

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  desc?: string;
}

const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    start: new Date(2024, 5, 15, 10, 0),
    end: new Date(2024, 5, 15, 11, 0),
    desc: "Weekly team sync-up",
  },
  {
    id: "2",
    title: "Project Deadline",
    start: new Date(2024, 5, 20, 9, 0),
    end: new Date(2024, 5, 20, 17, 0),
    desc: "Submit quarterly project report",
  },
];

const EventManagementCalendar: React.FC = () => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>(
    initialEvents.filter((event) =>
      moment(event.start).isSame(new Date(), "day")
    )
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const addEvent = (newEvent: CalendarEvent) => {
    setEvents([...events, newEvent]);
    setTodaysEvents(
      [...events, newEvent].filter((event) =>
        moment(event.start).isSame(new Date(), "day")
      )
    );
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    const updatedEvents = events.map((event) =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
    setTodaysEvents(
      updatedEvents.filter((event) =>
        moment(event.start).isSame(new Date(), "day")
      )
    );
    setEventToEdit(null);
    setIsEditMode(false);
  };

  const deleteEvent = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const filteredEvents = events.filter((event) => event.id !== eventId);
      setEvents(filteredEvents);
      setTodaysEvents(
        filteredEvents.filter((event) =>
          moment(event.start).isSame(new Date(), "day")
        )
      );
      setSelectedEvent(null);
    }
  };

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleEditEvent = () => {
    if (selectedEvent) {
      setEventToEdit(selectedEvent);
      setIsEditMode(true);
      toggleModal();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Calendar Section */}
      <div className="w-full lg:w-[70%] lg:pr-4 mb-4 lg:mb-0">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] md:h-[600px] lg:h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            selectable
            className="h-full custom-calendar"
            views={["month", "week", "day"]}
            defaultView="month"
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[30%] bg-white shadow-lg rounded-xl p-4 h-[300px] md:h-[400px] lg:h-[700px] flex flex-col">
        <button
          onClick={toggleModal}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg mb-4 hover:bg-blue-600 transition-colors"
        >
          Add Event
        </button>

        {/* Today's Events */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Today's Events</h2>
        {todaysEvents.length === 0 ? (
          <p className="text-gray-500 text-center">No events today</p>
        ) : (
          <div className="space-y-3 overflow-y-auto">
            {todaysEvents.map((event) => (
              <div
                key={event.id}
                className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 hover:bg-blue-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {moment(event.start).format("h:mm A")} -{" "}
                  {moment(event.end).format("h:mm A")}
                </p>
                {event.desc && (
                  <p className="text-xs text-gray-500 mt-1">{event.desc}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected Event Details */}
        {selectedEvent && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              {moment(selectedEvent.start).format("MMMM Do, YYYY")}
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-gray-800">
                {selectedEvent.title}
              </h3>
              <p className="text-sm text-gray-600">
                {moment(selectedEvent.start).format("h:mm A")} -{" "}
                {moment(selectedEvent.end).format("h:mm A")}
              </p>
              {selectedEvent.desc && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedEvent.desc}
                </p>
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleEditEvent}
                  className="bg-yellow-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(selectedEvent.id)}
                  className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddEventModal
          onClose={toggleModal}
          onSave={isEditMode ? updateEvent : addEvent}
          eventToEdit={eventToEdit}
        />
      )}
    </div>
  );
};

export default EventManagementCalendar;
