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
  File as FilePdf, 
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
  maxFileSizeMB = 10, // Default to 10MB
  uploadText = "Upload File",
  className = "",
  variant = "outline",
  fullWidth = false,
}: FileUploadButtonProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Handle file selection from input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    processFile(e.target.files[0]);
  };
  
  // Process the selected file
  const processFile = (file: File) => {
    // Check file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setUploadError(`File size exceeds the ${maxFileSizeMB}MB limit`);
      return;
    }
    
    // Check file type if acceptedFileTypes is specified
    if (acceptedFileTypes !== "*") {
      const fileType = file.type;
      const acceptedTypes = acceptedFileTypes.split(',').map(type => type.trim());
      
      // Check if the file type matches any of the accepted types
      const isAccepted = acceptedTypes.some(type => {
        if (type.includes('/*')) {
          // Handle wildcard types like 'image/*'
          const typePrefix = type.split('/')[0];
          return fileType.startsWith(`${typePrefix}/`);
        }
        return type === fileType;
      });
      
      if (!isAccepted) {
        setUploadError(`File type not accepted. Please upload ${acceptedFileTypes}`);
        return;
      }
    }
    
    setSelectedFile(file);
    simulateUpload(file);
  };
  
  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  // This is a simulation - in a real app, replace with actual upload
  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Calculate a more realistic upload time based on file size
    // Assume a 1MB/s upload speed for simulation
    const fileSizeMB = file.size / (1024 * 1024);
    const estimatedTimeMs = Math.max(1000, Math.min(fileSizeMB * 1000, 10000));
    
    const intervalTime = 100;
    const steps = estimatedTimeMs / intervalTime;
    let currentStep = 0;
    
    // Show initial toast for large files
    if (fileSizeMB > 2) {
      toast({
        title: "Uploading file",
        description: `${file.name} (${fileSizeMB.toFixed(1)} MB) is being uploaded...`,
      });
    }
    
    const interval = setInterval(() => {
      currentStep++;
      
      // Make progress non-linear to simulate real upload behavior
      // Faster at start, slower near the end
      const progress = Math.min(
        Math.round((Math.pow(currentStep / steps, 0.8) * 100)), 
        99
      );
      
      setUploadProgress(progress);
      
      if (currentStep >= steps) {
        // Final step - simulate server processing
        setTimeout(() => {
          clearInterval(interval);
          setUploadProgress(100);
          
          setTimeout(() => {
            setIsUploading(false);
            
            if (onUpload) {
              onUpload(file);
            }
            
            toast({
              title: "File uploaded successfully",
              description: `${file.name} has been uploaded.`,
            });
          }, 500);
        }, 500);
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
    <div 
      className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedFileTypes}
        className="hidden"
      />
      
      {!selectedFile ? (
        <div className={`flex flex-col items-center ${isDragging ? 'opacity-70' : ''}`}>
          <div 
            className={`
              border-2 border-dashed rounded-lg p-6 w-full flex flex-col items-center justify-center
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'} 
              transition-colors cursor-pointer
            `}
            onClick={handleUploadClick}
          >
            <UploadCloud className={`h-10 w-10 mb-3 ${isDragging ? 'text-primary animate-bounce' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">{uploadText}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isDragging ? 'Drop your file here' : 'Drag and drop or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {maxFileSizeMB && `Max size: ${maxFileSizeMB}MB`}
              {acceptedFileTypes !== "*" && acceptedFileTypes !== "" && ` • Accepted: ${acceptedFileTypes.replace(/image\/\*/g, 'images')}`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-md p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              {getFileIcon(selectedFile)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{selectedFile.name}</div>
              <div className="text-xs text-gray-500 flex items-center">
                {formatFileSize(selectedFile.size)}
                {uploadProgress === 100 && (
                  <span className="ml-2 text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Uploaded
                  </span>
                )}
              </div>
            </div>
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : uploadProgress === 100 ? (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={clearFile}
                className="text-xs"
              >
                Replace
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={clearFile}
                className="h-7 w-7 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5 bg-gray-100" />
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