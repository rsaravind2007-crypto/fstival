const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) errorMessage = errorData.detail;
        else if (errorData.message) errorMessage = errorData.message;
      } catch {
        // use default statusText
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[API Guardian Client] Request failed for ${url}:`, error);
    throw error;
  }
}
