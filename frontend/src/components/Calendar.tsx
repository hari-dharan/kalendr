import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventAPI, type Event, type EventCreate } from '../services/api';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await eventAPI.getEvents();
      // Transform for FullCalendar: all_day -> allDay
      const transformedEvents = fetchedEvents.map(event => ({
        ...event,
        allDay: event.all_day
      }));
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (selectInfo: any) => {
    const title = prompt('Enter event title:');
    if (!title) return;

    const newEvent: EventCreate = {
      title,
      description: '',
      location: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      all_day: selectInfo.allDay,
      color: '#3b82f6'
    };

    try {
      const createdEvent = await eventAPI.createEvent(newEvent);
      const transformedEvent = {
        ...createdEvent,
        allDay: createdEvent.all_day
      };
      setEvents(prev => [...prev, transformedEvent]);
      selectInfo.view.calendar.unselect();
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event');
    }
  };

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
            description: event.extendedProps?.description || '',
            location: event.extendedProps?.location || '',
            start: event.startStr,
            end: event.endStr || event.startStr,
            all_day: event.allDay,
            color: event.backgroundColor || '#3b82f6'
          };
          const result = await eventAPI.updateEvent(event.id, updatedEvent);
          const transformedResult = {
            ...result,
            allDay: result.all_day
          };
          setEvents(prev => prev.map(e => e.id === event.id ? transformedResult : e));
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
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        views={{
          timeGridWeek: {
            allDaySlot: true,
            slotDuration: '00:30:00'
          },
          timeGridDay: {
            allDaySlot: true,
            slotDuration: '00:30:00'
          }
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
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        businessHours={{
          startTime: '09:00',
          endTime: '17:00'
        }}
      />
    </div>
  );
};

export default Calendar;