/*
  # Create storage bucket for documents

  1. New Storage Bucket
    - `documents` bucket for storing all application documents
    
  2. Security
    - Enable RLS on storage.objects
    - Authenticated users can upload files
    - Authenticated users can view files
    - Users can only delete their own uploaded files
    
  3. Configuration
    - Public bucket: false (requires authentication)
    - File size limit: 50MB
    - Allowed mime types: images, PDFs, documents
*/

-- Create the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage.objects

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to view all documents
CREATE POLICY "Authenticated users can view documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- Allow users to update their own uploaded files
CREATE POLICY "Users can update own uploaded documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid() = owner);

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete own uploaded documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid() = owner);
