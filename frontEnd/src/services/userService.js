import api from "./api.js";

export const userService = {
  getProfile: async () => {
    const res = await api.get("/users/profile");
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch("/users/profile", data);
    return res.data;
  },

  updateWater: async (glasses) => {
    const res = await api.patch("/users/water", { glasses });
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.patch("/users/password", data);
    return res.data;
  },
};
