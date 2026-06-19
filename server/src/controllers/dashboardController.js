// DASHBOARD CONTROLLER — only HTTP handling

import { getDashboardStatsService } from "../services/dashboardService.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};