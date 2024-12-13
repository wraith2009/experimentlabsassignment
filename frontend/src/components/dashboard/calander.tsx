/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import apiCall from "../../api/api";
import EventModal from "./AddEventModal";
import { UserIdState } from "../../recoil/atom/auth.atoms";
import { useRecoilValue } from "recoil";
import { Container } from "./container";
import { Header } from "./header";

// Calendar Event Interface
interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  desc?: string;
}

const EventManagementCalendar: React.FC = () => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>(
    []
  );
  const userId = useRecoilValue(UserIdState);

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiCall("/get-event", { userId });
        const fetchedEvents = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          desc: event.description || "",
        }));
        setEvents(fetchedEvents);
        handleDateSelect(new Date()); // Show today's events by default
      } catch (error) {
        console.error("Error fetching events:", error);
        alert("Failed to fetch events. Please try again.");
      }
    };
    fetchEvents();
  }, [userId]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const addEvent = async (newEvent: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setIsModalOpen(false);
  };

  const updateEvent = async (updatedEvent: CalendarEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setIsModalOpen(false);
    setEventToEdit(null);
    handleDateSelect(updatedEvent.start);
  };

  const deleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await apiCall("/delete-event", { eventId });
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        setSelectedDateEvents([]);
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const handleDateSelect = useCallback(
    (date: Date) => {
      const selectedDate = moment(date).startOf("day");
      const filteredEvents = events.filter((event) =>
        moment(event.start).isSame(selectedDate, "day")
      );
      setSelectedDateEvents(filteredEvents);
    },
    [events]
  );

  return (
    <>
      <Header />
      <Container>
        <>
          <div className="flex flex-col lg:flex-row mx-auto h-[calc(100dvh_-_80.8px)] p-4 md:p-8">
            <div className="w-full lg:w-9/12 lg:pr-4 mb-4 lg:mb-0">
              <div className="bg-white h-[400px] md:h-[600px] lg:h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  onSelectEvent={(event) => handleDateSelect(event.start)}
                  selectable
                  className="h-full custom-calendar"
                  views={["month", "week", "day"]}
                  defaultView="month"
                  style={{ height: "500" }}
                />
              </div>
            </div>

            <div className="w-full lg:w-3/12 bg-white shadow-[0px_0px_10px_0px_rgba(0,_0,_0,_0.11)] rounded-xl p-4 flex flex-col">
              <button
                onClick={() => {
                  setEventToEdit(null);
                  toggleModal();
                }}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg mb-4 hover:bg-blue-600 transition-colors"
              >
                Add Event
              </button>

              {selectedDateEvents.length > 0 ? (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Events for{" "}
                    {moment(selectedDateEvents[0].start).format(
                      "MMMM Do, YYYY"
                    )}
                  </h2>
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          moment(event.start).isSame(moment(), "day")
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        <h3 className="font-semibold text-gray-800">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {moment(event.start).format("h:mm A")} -{" "}
                          {moment(event.end).format("h:mm A")}
                        </p>
                        {event.desc && (
                          <p className="text-sm text-gray-500 mt-2">
                            {event.desc}
                          </p>
                        )}
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setEventToEdit(event);
                              toggleModal();
                            }}
                            className="bg-yellow-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center">
                  No events for the selected date.
                </p>
              )}
            </div>
          </div>

          <EventModal
            isOpen={isModalOpen}
            onClose={toggleModal}
            onSave={eventToEdit ? updateEvent : addEvent}
            existingEvent={
              eventToEdit
                ? {
                    ...eventToEdit,
                    startDate: eventToEdit.start,
                    endDate: eventToEdit.end,
                  }
                : null
            }
          />
        </>
      </Container>
    </>
  );
};

export default EventManagementCalendar;
