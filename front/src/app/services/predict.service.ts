import { axiosInstance } from "./axiosInstance";

export interface ImagePredictResponse {
  prediction: string;
  confidence: number;
}

export interface PredictHistoryItem {
  /** Set from API `id` or `_id` after normalization */
  id?: string;
  prediction: string;
  confidence: number;
  createdAt?: string;
  imageUrl?: string;
  image?: string;
  url?: string;
}

/** Full record from GET /history/:id */
export type PredictHistoryDetail = PredictHistoryItem;

const PREDICT_PREFIX = "/api/predict";

function normalizeHistoryItem(raw: unknown): PredictHistoryItem {
  if (!raw || typeof raw !== "object") {
    return { prediction: "", confidence: 0 };
  }
  const o = raw as Record<string, unknown>;
  const idSource = o.id ?? o._id ?? o.uuid ?? o.predictionId ?? o.historyId;
  const id =
    idSource !== undefined && idSource !== null ? String(idSource) : undefined;
  const conf = o.confidence;
  const confidence =
    typeof conf === "number"
      ? conf
      : typeof conf === "string"
        ? Number.parseFloat(conf)
        : Number(conf);
  return {
    id,
    prediction: String(o.prediction ?? ""),
    confidence: Number.isFinite(confidence) ? confidence : 0,
    createdAt:
      o.createdAt != null
        ? String(o.createdAt)
        : o.created_at != null
          ? String(o.created_at)
          : undefined,
    imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : undefined,
    image: typeof o.image === "string" ? o.image : undefined,
    url: typeof o.url === "string" ? o.url : undefined,
  };
}

function normalizeHistoryPayload(payload: unknown): PredictHistoryItem[] {
  let list: unknown[] = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const o = payload as {
      data?: unknown;
      history?: unknown;
      predictions?: unknown;
    };
    const nested = o.history ?? o.data ?? o.predictions;
    list = Array.isArray(nested) ? nested : [];
  }
  return list.map(normalizeHistoryItem);
}

function normalizeHistoryDetail(payload: unknown): PredictHistoryDetail {
  let inner: unknown = payload;
  if (inner && typeof inner === "object" && "data" in inner) {
    const d = (inner as { data: unknown }).data;
    if (d && typeof d === "object") inner = d;
  }
  if (!inner || typeof inner !== "object") {
    return { prediction: "", confidence: 0 };
  }
  return normalizeHistoryItem(inner) as PredictHistoryDetail;
}

export const predictService = {
  getHistoryById: async (id: string) => {
    const { data } = await axiosInstance.get<unknown>(
      `${PREDICT_PREFIX}/history/${encodeURIComponent(id)}`,
    );
    return normalizeHistoryDetail(data);
  },

  getHistory: async () => {
    const { data } = await axiosInstance.get<unknown>(
      `${PREDICT_PREFIX}/history`,
    );
    return normalizeHistoryPayload(data);
  },

  predictImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await axiosInstance.post<ImagePredictResponse>(
      `${PREDICT_PREFIX}/image`,
      formData,
      {
        transformRequest: [
          (payload, headers) => {
            if (payload instanceof FormData) {
              delete headers["Content-Type"];
            }
            return payload;
          },
        ],
      },
    );
    return data;
  },
};
