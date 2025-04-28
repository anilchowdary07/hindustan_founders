import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UploadCloud, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FilePdf, 
  Package, 
  X, 
  Check,
  AlertCircle,
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadButtonProps {
  onUpload?: (file: File) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  uploadText?: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  fullWidth?: boolean;
}

export default function FileUploadButton({
  onUpload,
  acceptedFileTypes = "*",
  maxFileSizeMB = 10,
  uploadText = "Upload File",
  className = "",
  variant = "outline",
  fullWidth = false,
}: FileUploadButtonProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Check file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setUploadError(`File size exceeds the ${maxFileSizeMB}MB limit`);
      return;
    }
    
    setSelectedFile(file);
    simulateUpload(file);
  };
  
  // This is a simulation - in a real app, replace with actual upload
  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const totalTime = 2000; // 2 seconds to simulate upload
    const intervalTime = 100;
    const steps = totalTime / intervalTime;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setUploadProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setIsUploading(false);
        
        if (onUpload) {
          onUpload(file);
        }
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded.`,
        });
      }
    }, intervalTime);
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (file.type.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (file.type.startsWith('video/')) return <FileVideo className="h-5 w-5" />;
    if (file.type.startsWith('audio/')) return <FileAudio className="h-5 w-5" />;
    if (file.type === 'application/pdf' || extension === 'pdf') return <FilePdf className="h-5 w-5" />;
    if (file.type.includes('document') || ['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="h-5 w-5" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <Package className="h-5 w-5" />;
    }
    
    return <File className="h-5 w-5" />;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedFileTypes}
        className="hidden"
      />
      
      {!selectedFile ? (
        <Button 
          type="button" 
          onClick={handleUploadClick} 
          variant={variant} 
          className={`${className} ${fullWidth ? 'w-full' : ''}`}
        >
          <UploadCloud className="h-4 w-4 mr-2" />
          {uploadText}
        </Button>
      ) : (
        <div className="bg-gray-50 border rounded-md p-3">
          <div className="flex items-center gap-3">
            {getFileIcon(selectedFile)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{selectedFile.name}</div>
              <div className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</div>
            </div>
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : uploadProgress === 100 ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={clearFile}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-1" />
              <div className="text-xs text-right text-gray-500 mt-1">
                {uploadProgress}%
              </div>
            </div>
          )}
        </div>
      )}
      
      {uploadError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs ml-2">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-xs text-gray-500 mt-1">
        {maxFileSizeMB && `Max file size: ${maxFileSizeMB}MB`}
        {acceptedFileTypes !== "*" && acceptedFileTypes !== "" && ` • Accepted types: ${acceptedFileTypes}`}
      </div>
    </div>
  );
}