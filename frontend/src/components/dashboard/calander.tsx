/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import apiCall from "../../api/api";
import EventModal from "./AddEventModal";
import { UserIdState } from "../../recoil/atom/auth.atoms";
import { useRecoilValue, useRecoilState } from "recoil";
import { Container } from "./container";
import { Header } from "./header";
import { eventState } from "../../recoil/atom/event.atoms";

interface CalendarEvent extends Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  userId?: string;
}

const EventManagementCalendar: React.FC = () => {
  const localizer = momentLocalizer(moment);
  const [globalEvents, setGlobalEvents] = useRecoilState(eventState);
  const [global, setGlobal] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>(
    []
  );
  const userId = useRecoilValue(UserIdState);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiCall("/get-event", { userId });
        const fetchedEvents = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          description: event.description || "",
        }));
        setGlobalEvents(fetchedEvents);
        handleDateSelect(new Date());
      } catch (error) {
        console.error("Error fetching events:", error);
        alert("Failed to fetch events. Please try again.");
      }
    };
    fetchEvents();
  }, [userId, setGlobalEvents]);

  useEffect(() => {
    setSelectedDateEvents(globalEvents);
  }, [globalEvents, setGlobal]);

  console.log("global", global);
  console.log("events", globalEvents);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleDateSelect = useCallback(
    (date: Date) => {
      const selectedDate = moment(date).startOf("day");
      const filteredEvents = globalEvents.filter((event) =>
        moment(event.startDate).isSame(selectedDate, "day")
      );
      setSelectedDateEvents(filteredEvents);
    },
    [globalEvents]
  );

  const deleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await apiCall("/delete-event", { eventId });
        setGlobalEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        setSelectedDateEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const updateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      const response = await apiCall("/update-event", updatedEvent);
      console.log(response);
      setGlobalEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      setSelectedDateEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  const addEvent = async (newEvent: CalendarEvent) => {
    try {
      const response = await apiCall("/create-event", newEvent);
      console.log(response);
      const addedEvent = {
        ...newEvent,
        id: response.event.id,
      };
      setGlobalEvents((prevEvents) => [...prevEvents, addedEvent]);
      setSelectedDateEvents((prevEvents) => [...prevEvents, addedEvent]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    }
  };

  console.log("selectedDateEvents", selectedDateEvents);

  return (
    <>
      <Header />

      <Container>
        <>
          <div className="flex flex-col lg:flex-row mx-auto h-[calc(100dvh_-_80.8px)] p-4 md:p-8">
            <div className="w-full lg:w-9/12 lg:pr-4 mb-4 lg:mb-0">
              <div className="bg-white h-[400px] md:h-[600px] lg:h-[600px]">
                {globalEvents.length > 0 && (
                  <Calendar
                    localizer={localizer}
                    events={globalEvents}
                    startAccessor="startDate"
                    endAccessor="endDate"
                    onSelectEvent={(event: CalendarEvent) =>
                      handleDateSelect(event.startDate)
                    }
                    selectable
                    className="h-full custom-calendar"
                    views={["month", "week", "day"]}
                    defaultView="month"
                    style={{ height: "500" }}
                  />
                )}
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
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-2">
                            {event.description}
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
                    startDate: eventToEdit.startDate,
                    endDate: eventToEdit.endDate,
                    description: eventToEdit.description || "",
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
