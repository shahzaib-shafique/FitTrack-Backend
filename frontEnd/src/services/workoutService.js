import api from "./api.js";

export const workoutService = {
  getAll: async (params = {}) => {
    const res = await api.get("/workouts", { params });
    return res.data;
  },

  getStats: async () => {
    const res = await api.get("/workouts/stats");
    return res.data;
  },

  getOne: async (id) => {
    const res = await api.get(`/workouts/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/workouts", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.patch(`/workouts/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/workouts/${id}`);
    return res.data;
  },
};
