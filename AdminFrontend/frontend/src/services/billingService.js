import apiClient from './apiClient';
import { API_BASE_URL, API_V1_BASE_URL } from '../config/api';

/**
 * Get the current tenant's subscription details.
 */
export const getSubscription = async () => {
  return await apiClient.get(`${API_BASE_URL}/admin/subscription`);
};

/**
 * Get the current tenant's billing history.
 */
export const getBillingHistory = async (page = 1, perPage = 20) => {
  return await apiClient.get(`${API_BASE_URL}/admin/billing-history?page=${page}&per_page=${perPage}`);
};

/**
 * Change the current tenant's subscription plan.
 */
export const changePlan = async (newPlanId, changeImmediately = true) => {
  return await apiClient.post(`${API_BASE_URL}/admin/change-plan`, {
    new_plan_id: newPlanId,
    change_immediately: changeImmediately,
  });
};

/**
 * Get all available public plans (no auth required).
 */
export const getAvailablePlans = async () => {
  return await apiClient.get(`${API_V1_BASE_URL}/plans`);
};
