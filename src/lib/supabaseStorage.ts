/**
 * Document upload helper — routes all file uploads through the backend
 * which uses the Supabase service role key (never exposed to the browser).
 *
 * The anon key cannot create/write buckets; only the service role can.
 * Calling this directly from the client with the anon key always throws NoSuchBucket.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function uploadCounselorDocument(
  file: File,
  _folder: string = 'counselor-ids'
): Promise<{ url: string; name: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BACKEND_URL}/upload/counselor-doc`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Document upload failed (${response.status}): ${errText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Document upload returned failure status.');
  }

  return { url: result.url, name: result.name };
}
