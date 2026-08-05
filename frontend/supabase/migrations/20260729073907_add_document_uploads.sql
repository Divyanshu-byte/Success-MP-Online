/*
# Add Document Uploads Support

1. Schema Changes
   - Add `documents` jsonb column to `applications` table to store
     a map of document-name -> storage path / metadata for each
     uploaded file. Defaults to an empty jsonb object.

2. Storage
   - Create a private storage bucket `application-documents` for
     storing user-uploaded document files (JPG, PNG, PDF).
   - Storage policies allow authenticated users to read/write only
     files inside their own user-id folder.

3. Security
   - RLS already enabled on `applications`; no changes needed there.
   - Storage policies scope access by `auth.uid()` matching the
     folder prefix in the file path.
*/

-- Add documents column to applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'applications'
      AND column_name = 'documents'
  ) THEN
    ALTER TABLE applications ADD COLUMN documents jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can manage files only within their own folder
DROP POLICY IF EXISTS "users_read_own_documents" ON storage.objects;
CREATE POLICY "users_read_own_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "users_insert_own_documents" ON storage.objects;
CREATE POLICY "users_insert_own_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "users_update_own_documents" ON storage.objects;
CREATE POLICY "users_update_own_documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "users_delete_own_documents" ON storage.objects;
CREATE POLICY "users_delete_own_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
