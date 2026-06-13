export interface PredictionResult {
  id: number;
  grade: number;
  class_name: string;
  confidence: number;
  scores: Record<string, number>;
  mask: string | null;
  overlay: string | null;
  image_data?: string | null;
  patient_id?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface HistoryResponse {
  total: number;
  page: number;
  per_page: number;
  predictions: PredictionResult[];
}
