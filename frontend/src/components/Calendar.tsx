import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventAPI, type Event, type EventCreate } from '../services/api';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await eventAPI.getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection (for creating new events)
  const handleDateSelect = async (selectInfo: any) => {
    const title = prompt('Enter event title:');
    if (!title) return;

    const newEvent: EventCreate = {
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      color: '#3b82f6' // Default blue color
    };

    try {
      const createdEvent = await eventAPI.createEvent(newEvent);
      setEvents(prev => [...prev, createdEvent]);
      selectInfo.view.calendar.unselect(); // Clear the selection
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event');
    }
  };

  // Handle event click (for editing/deleting)
  const handleEventClick = async (clickInfo: any) => {
    const event = clickInfo.event;
    const action = prompt(
      `Event: ${event.title}\n\nOptions:\n- Type "edit" to edit\n- Type "delete" to delete\n- Press Cancel to close`,
      'edit'
    );

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
        try {
          await eventAPI.deleteEvent(event.id);
          setEvents(prev => prev.filter(e => e.id !== event.id));
        } catch (error) {
          console.error('Failed to delete event:', error);
          alert('Failed to delete event');
        }
      }
    } else if (action === 'edit') {
      const newTitle = prompt('Enter new title:', event.title);
      if (newTitle && newTitle !== event.title) {
        try {
          const updatedEvent: EventCreate = {
            title: newTitle,
            start: event.startStr,
            end: event.endStr,
            color: event.backgroundColor
          };
          const result = await eventAPI.updateEvent(event.id, updatedEvent);
          setEvents(prev => prev.map(e => e.id === event.id ? result : e));
        } catch (error) {
          console.error('Failed to update event:', error);
          alert('Failed to update event');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="loading">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Kalendr</h1>
        <p>Click and drag to create events, click events to edit or delete</p>
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        events={events}
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        editable={true}
        dayMaxEvents={true}
        height="auto"
        eventDisplay="block"
      />
    </div>
  );
};

export default Calendar;