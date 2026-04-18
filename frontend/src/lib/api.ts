/**
 * API Client
 * ==========
 * Centralized HTTP client for backend communication.
 * Handles auth headers, base URL, and error normalization.
 */

const API_BASE = "http://localhost:8000/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: unknown): void {
  localStorage.setItem("user", JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, isFormData = false } = options;
  const token = getToken();

  const fetchHeaders: Record<string, string> = { ...headers };
  if (token) fetchHeaders["Authorization"] = `Bearer ${token}`;
  if (!isFormData) fetchHeaders["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: fetchHeaders,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(err.detail || `HTTP ${res.status}`, res.status);
  }

  return res.json();
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────

export async function register(data: {
  email: string;
  password: string;
  full_name: string;
  pan_card: string;
}) {
  return request("/auth/register", { method: "POST", body: data });
}

export async function login(data: {
  email: string;
  password: string;
  pan_card: string;
}) {
  const res = await request<{ access_token: string; user: unknown }>("/auth/login", {
    method: "POST",
    body: data,
  });
  setToken(res.access_token);
  if (res.user) setStoredUser(res.user);
  return res;
}

export async function getMe() {
  return request("/auth/me");
}

// ─── CAS UPLOAD ───────────────────────────────────────────────────────────────

export async function uploadCAS(file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<{
    id: string;
    filename: string;
    status: string;
    holdings_count: number;
    error_message: string | null;
  }>("/cas/upload", { method: "POST", body: form, isFormData: true });
}

export async function getCASUploads() {
  return request<Array<{
    id: string;
    filename: string;
    status: string;
    holdings_count: number;
    upload_date: string;
  }>>("/cas/uploads");
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────

export type HoldingData = {
  id: string;
  symbol: string;
  name: string;
  isin: string | null;
  quantity: number;
  avg_cost: number | null;
  current_price: number | null;
  market_value: number | null;
  asset_type: string;
  sector: string | null;
  pnl: number | null;
  pnl_percent: number | null;
};

export async function getHoldings() {
  return request<HoldingData[]>("/portfolio/holdings");
}

export type PortfolioSummaryData = {
  total_invested: number;
  current_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  holdings_count: number;
};

export async function getPortfolioSummary() {
  return request<PortfolioSummaryData>("/portfolio/summary");
}

export type AllocationItem = {
  sector: string;
  value: number;
  percentage: number;
  color: string | null;
};

export async function getPortfolioAllocation() {
  return request<{
    by_sector: AllocationItem[];
    by_asset_type: AllocationItem[];
  }>("/portfolio/allocation");
}

// ─── STOCKS ───────────────────────────────────────────────────────────────────

export type StockPrice = {
  symbol: string;
  name: string | null;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  volume: number;
  market_cap: number | null;
};

export async function getStockPrice(symbol: string) {
  return request<StockPrice>(`/stocks/price/${symbol}`);
}

export type StockHistoryPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function getStockHistory(symbol: string, period = "6mo") {
  return request<{
    symbol: string;
    period: string;
    data: StockHistoryPoint[];
  }>(`/stocks/history/${symbol}?period=${period}`);
}

// ─── XAI ──────────────────────────────────────────────────────────────────────

export async function explainAsset(data: {
  symbol: string;
  current_price: number;
  change_percent: number;
  factors: Record<string, number>;
  language?: string;
}) {
  return request<{
    symbol: string;
    explanation: string;
    shap_values: Record<string, number> | null;
  }>("/explain", { method: "POST", body: data });
}

// ─── NEW: MARKET, NEWS & WATCHLIST ─────────────────────────────────────────

export async function getMarketSnapshot() {
  return request<StockPrice[]>("/market/snapshot");
}

export async function getMarketMovers() {
  return request<{ gainers: StockPrice[]; losers: StockPrice[] }>("/market/movers");
}

export type NewsArticle = {
  title: string;
  description: string;
  url: string;
  source: { name: string };
};

export async function getNews() {
  return request<NewsArticle[]>("/news");
}

export async function getWatchlist() {
  return request<StockPrice[]>("/watchlist");
}

export async function addToWatchlist(symbol: string) {
  return request<{ message: string; symbol: string }>("/watchlist", {
    method: "POST",
    body: { symbol },
  });
}

export async function removeFromWatchlist(symbol: string) {
  return request<{ message: string; symbol: string }>(`/watchlist/${symbol}`, {
    method: "DELETE",
  });
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export default {
  register,
  login,
  getMe,
  uploadCAS,
  getCASUploads,
  getHoldings,
  getPortfolioSummary,
  getPortfolioAllocation,
  getStockPrice,
  getStockHistory,
  explainAsset,
  getMarketSnapshot,
  getMarketMovers,
  getNews,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
