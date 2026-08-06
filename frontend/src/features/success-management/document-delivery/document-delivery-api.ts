import { API_BASE_URL, getAuthHeaders } from "@/lib/apiClient";
import { DeliveryResult } from "../types";

export async function deliverDocument(
  applicationId: string,
  file: File,
  overwrite?: boolean,
): Promise<DeliveryResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (overwrite) {
    formData.append("overwrite", "true");
  }

  const tokenHeaders = getAuthHeaders();
  // Remove Content-Type so browser sets boundary for multipart
  delete (tokenHeaders as any)["Content-Type"];

  const res = await fetch(`${API_BASE_URL}/applications/${applicationId}/deliver`, {
    method: "POST",
    headers: tokenHeaders,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Delivery failed with status ${res.status}`);
  }

  return res.json();
}
