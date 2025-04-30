import axios, { AxiosProgressEvent } from "axios";
import { API_URL } from "./constants";

interface UploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

interface UploadProgress {
  progress: number;
  abort: () => void;
}

/**
 * Uploads a file to the server with progress tracking
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress (0-100)
 * @param folder Optional folder to upload to (defaults to 'general')
 * @returns Promise with the upload response
 */
export const uploadFile = (
  file: File,
  onProgress?: (progress: number) => void,
  folder: string = "general"
): Promise<UploadResponse> & { trackProgress: UploadProgress } => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const controller = new AbortController();
  const { signal } = controller;

  const uploadPromise = axios
    .post<UploadResponse>(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      signal,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      },
    })
    .then((response: any) => response.data)
    .catch((error: any) => {
      // If the request was aborted, don't throw
      if (axios.isCancel(error)) {
        return {
          fileUrl: "",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          aborted: true,
        };
      }
      throw error;
    });

  // Attach the progress tracking info to the promise
  const progressObj: UploadProgress = {
    progress: 0,
    abort: () => controller.abort(),
  };

  (uploadPromise as any).trackProgress = progressObj;

  return uploadPromise as Promise<UploadResponse> & { trackProgress: UploadProgress };
};

/**
 * Uploads multiple files to the server
 * @param files Array of files to upload
 * @param onProgress Optional callback for overall progress (0-100)
 * @param onFileProgress Optional callback for individual file progress
 * @param folder Optional folder to upload to (defaults to 'general')
 * @returns Promise with array of upload responses
 */
export const uploadMultipleFiles = async (
  files: File[],
  onProgress?: (progress: number) => void,
  onFileProgress?: (fileIndex: number, progress: number) => void,
  folder: string = "general"
): Promise<UploadResponse[]> => {
  const totalFiles = files.length;
  const results: UploadResponse[] = [];
  let completedFiles = 0;

  // Upload files sequentially to avoid overwhelming the server
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    try {
      const result = await uploadFile(
        file,
        (progress) => {
          if (onFileProgress) {
            onFileProgress(i, progress);
          }
          
          // Calculate overall progress
          const overallProgress = Math.round(
            ((completedFiles * 100) + progress) / totalFiles
          );
          
          if (onProgress) {
            onProgress(overallProgress);
          }
        },
        folder
      );
      
      results.push(result);
      completedFiles++;
      
      // Update overall progress
      if (onProgress) {
        onProgress(Math.round((completedFiles * 100) / totalFiles));
      }
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      // Add a placeholder for the failed upload
      results.push({
        fileUrl: "",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        error: true,
      } as UploadResponse);
      
      completedFiles++;
    }
  }

  return results;
};

/**
 * Validates a file against size and type constraints
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @param acceptedTypes Comma-separated list of accepted MIME types or extensions (e.g. "image/*,application/pdf")
 * @returns An error message if validation fails, or null if valid
 */
export const validateFile = (
  file: File,
  maxSizeMB: number = 10,
  acceptedTypes: string = "*"
): string | null => {
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size exceeds the ${maxSizeMB}MB limit`;
  }
  
  // Check file type if acceptedTypes is specified
  if (acceptedTypes !== "*") {
    const fileType = file.type;
    const acceptedTypesList = acceptedTypes.split(',').map(type => type.trim());
    
    // Check if the file type matches any of the accepted types
    const isAccepted = acceptedTypesList.some(type => {
      if (type.includes('/*')) {
        // Handle wildcard types like 'image/*'
        const typePrefix = type.split('/')[0];
        return fileType.startsWith(`${typePrefix}/`);
      }
      return type === fileType;
    });
    
    if (!isAccepted) {
      return `File type not accepted. Please upload ${acceptedTypes}`;
    }
  }
  
  return null;
};
