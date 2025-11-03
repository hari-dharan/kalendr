import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end?: string;
  all_day: boolean;
  color?: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  location?: string;
  start: string;
  end?: string;
  all_day: boolean;
  color?: string;
}

// Event API functions
export const eventAPI = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get("/events");
    return response.data;
  },

  // Create new event
  createEvent: async (event: EventCreate): Promise<Event> => {
    const response = await api.post("/events", event);
    return response.data;
  },

  // Update existing event
  updateEvent: async (id: string, event: EventCreate): Promise<Event> => {
    const response = await api.put(`/events/${id}`, event);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  }
};

export default api;
