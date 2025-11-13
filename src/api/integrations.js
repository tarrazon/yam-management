import { uploadFile as supabaseUploadFile, deleteFile } from './uploadService';

export const Core = {
  UploadFile: async ({ file }) => {
    return await supabaseUploadFile(file);
  },
  DeleteFile: async ({ filePath }) => {
    return await deleteFile(filePath);
  }
};

export const InvokeLLM = null;
export const SendEmail = null;
export const UploadFile = supabaseUploadFile;
export const GenerateImage = null;
export const ExtractDataFromUploadedFile = null;
export const CreateFileSignedUrl = null;
export const UploadPrivateFile = null;
