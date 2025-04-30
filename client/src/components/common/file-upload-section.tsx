import { useState } from "react";
import FileUploadButton from "./file-upload-button"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, FileIcon, Image, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
}

interface FileUploadSectionProps {
  title?: string;
  description?: string;
  maxFiles?: number;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  onFileUploaded?: (files: UploadedFile[]) => void;
  uploadText?: string;
  folder?: string;
}

export default function FileUploadSection({
  title = "Upload Files",
  description = "Upload files to share with the community.",
  maxFiles = 5,
  acceptedFileTypes = "*",
  maxFileSizeMB = 10,
  onFileUploaded,
  uploadText = "Upload File",
  folder = "general"
}: FileUploadSectionProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (fileUrl: string, file: File) => {
    setIsUploading(false);
    
    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date()
    };
    
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    
    if (onFileUploaded) {
      onFileUploaded(updatedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (!fileToRemove) return;
    
    // Only remove from local state for now
    // In a real implementation, you would also call the delete API
    // to remove the file from storage
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    
    toast({
      title: "File removed",
      description: `${fileToRemove.name} has been removed.`
    });
    
    if (onFileUploaded) {
      onFileUploaded(updatedFiles);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {files.length > 0 && (
          <div className="space-y-2 mb-4">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between bg-gray-50 p-3 rounded-md border"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {formatFileSize(file.size)}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {file.type.split('/')[1]}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {files.length < maxFiles ? (
          <FileUploadButton
            onUpload={handleFileUpload}
            acceptedFileTypes={acceptedFileTypes}
            maxFileSizeMB={maxFileSizeMB}
            uploadText={uploadText}
            folder={folder}
            fullWidth={true}
          />
        ) : (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Maximum number of files ({maxFiles}) reached.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        {maxFileSizeMB && `Maximum file size: ${maxFileSizeMB}MB`}
        {acceptedFileTypes !== "*" && ` • Accepted types: ${acceptedFileTypes.replace(/image\/\*/g, 'images')}`}
        {maxFiles && ` • Maximum ${maxFiles} files`}
      </CardFooter>
    </Card>
  );
}
