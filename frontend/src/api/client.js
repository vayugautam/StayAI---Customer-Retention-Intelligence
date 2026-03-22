import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const method = (config.method || "get").toUpperCase();
    const url = `${config.baseURL || ""}${config.url || ""}`;
    console.log(`${method} ${url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 404) {
      return null;
    }
    return Promise.reject(error);
  }
);

export async function getDashboardSummary() {
  try {
    const response = await api.get("/api/dashboard/summary");
    return response?.data ?? null;
  } catch (error) {
    console.error("getDashboardSummary failed", error);
    return null;
  }
}

export async function getCustomers(filters = {}) {
  try {
    const response = await api.get("/api/customers", {
      params: {
        tier: filters.tier,
        account_type: filters.account_type,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
      },
    });
    return response?.data ?? null;
  } catch (error) {
    console.error("getCustomers failed", error);
    return null;
  }
}

export async function getCustomer(id) {
  try {
    const response = await api.get(`/api/customers/${id}`);
    return response?.data ?? null;
  } catch (error) {
    console.error("getCustomer failed", error);
    return null;
  }
}

export async function generateMessage(customerId, channel) {
  try {
    const response = await api.post("/api/genai/message", {
      customer_id: customerId,
      channel,
    });
    return response?.data ?? null;
  } catch (error) {
    console.error("generateMessage failed", error);
    return null;
  }
}

export async function generateRMBrief(customerId) {
  try {
    const response = await api.post("/api/genai/rm-brief", {
      customer_id: customerId,
    });
    return response?.data ?? null;
  } catch (error) {
    console.error("generateRMBrief failed", error);
    return null;
  }
}

export async function getCampaigns() {
  try {
    const response = await api.get("/api/campaigns");
    return response?.data ?? null;
  } catch (error) {
    console.error("getCampaigns failed", error);
    return null;
  }
}

export async function getCampaignAnalytics() {
  try {
    const response = await api.get("/api/campaigns/analytics");
    return response?.data ?? null;
  } catch (error) {
    console.error("getCampaignAnalytics failed", error);
    return null;
  }
}

export async function saveOutreach(customerId, channel, message) {
  try {
    const response = await api.post("/api/outreach/save", {
      customer_id: customerId,
      channel,
      message,
    });
    return response?.data ?? null;
  } catch (error) {
    console.error("saveOutreach failed", error);
    return null;
  }
}

export { api };
