const API_BASE = "/api";

export async function uploadImage(
  file: File,
  patientId?: string,
  notes?: string
): Promise<Response> {
  const form = new FormData();
  form.append("file", file);
  if (patientId) form.append("patient_id", patientId);
  if (notes) form.append("notes", notes);

  return fetch(`${API_BASE}/predict/`, {
    method: "POST",
    body: form,
  });
}

export async function fetchHistory(
  page = 1,
  perPage = 20
): Promise<Response> {
  return fetch(`${API_BASE}/history/?page=${page}&per_page=${perPage}`);
}

export async function fetchPrediction(id: number): Promise<Response> {
  return fetch(`${API_BASE}/predict/${id}`);
}

export async function healthCheck(): Promise<Response> {
  return fetch(`${API_BASE}/health`);
}
