import apiClient from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const dealsService = {
  // Get all deals grouped by stage
  getDeals: async () => {
    return await apiClient.get(API_ENDPOINTS.CRM.DEALS)
  },

  // Get single deal details
  getDealById: async (dealId) => {
    return await apiClient.get(API_ENDPOINTS.CRM.DEAL_DETAIL(dealId))
  },

  // Create new deal
  createDeal: async (dealData) => {
    return await apiClient.post(API_ENDPOINTS.CRM.DEALS, dealData)
  },

  // Update deal
  updateDeal: async (dealId, dealData) => {
    return await apiClient.put(API_ENDPOINTS.CRM.DEAL_DETAIL(dealId), dealData)
  },

  // Move deal to different stage
  moveDealStage: async (dealId, newStage) => {
    return await apiClient.patch(`${API_ENDPOINTS.CRM.DEAL_STAGE(dealId)}?stage=${newStage}`)
  },

  // Delete deal
  deleteDeal: async (dealId) => {
    return await apiClient.delete(API_ENDPOINTS.CRM.DEAL_DETAIL(dealId))
  },

  // Add activity to deal
  addDealActivity: async (dealId, activityData) => {
    return await apiClient.post(API_ENDPOINTS.CRM.DEAL_ACTIVITY(dealId), activityData)
  },
}
