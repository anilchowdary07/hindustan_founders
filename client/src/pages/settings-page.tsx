import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Upload, File, X, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { uploadFile } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Define form schema
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  newPassword: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  connectionRequests: z.boolean().default(true),
  messageNotifications: z.boolean().default(true),
  jobAlerts: z.boolean().default(true),
});

const privacySchema = z.object({
  profileVisibility: z.enum(["public", "connections", "private"]).default("public"),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  allowTagging: z.boolean().default(true),
  allowMessaging: z.enum(["everyone", "connections", "none"]).default("everyone"),
  searchEngineIndexing: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;
type PrivacyFormValues = z.infer<typeof privacySchema>;

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Array<{id: string, name: string, url: string, type: string, size: number, uploadDate: Date}>>([]);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{id: string, name: string, url: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      title: user?.title || "",
      company: user?.company || "",
      location: user?.location || "",
      bio: user?.bio || "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      connectionRequests: true,
      messageNotifications: true,
      jobAlerts: true,
    },
  });
  
  // Privacy form
  const privacyForm = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      allowTagging: true,
      allowMessaging: "everyone",
      searchEngineIndexing: true,
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      try {
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          throw new Error("Please enter a valid email address");
        }
        
        // Track which fields have changed for better user feedback
        const changedFields = Object.entries(data).filter(
          ([key, value]) => user[key] !== value && value !== ""
        ).map(([key]) => {
          switch(key) {
            case 'name': return 'Name';
            case 'email': return 'Email';
            case 'title': return 'Title';
            case 'company': return 'Company';
            case 'location': return 'Location';
            case 'bio': return 'Bio';
            default: return key;
          }
        });
        
        const res = await apiRequest(`/api/users/${user.id}`, "PATCH", data);
        
        if (res.error) {
          // Special handling for common errors
          if (res.error.status === 409) {
            throw new Error("This email is already in use by another account");
          }
          throw new Error(res.error.message || "Failed to update profile");
        }
        
        return { data: res.data, changedFields };
      } catch (error) {
        console.error("Error updating profile:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update profile");
      }
    },
    onSuccess: (result) => {
      const { data: updatedUser, changedFields } = result;
      
      if (updatedUser) {
        // Update the user data in the cache
        queryClient.setQueryData(["user"], updatedUser);
        
        if (changedFields.length === 0) {
          toast({
            title: "No changes made",
            description: "Your profile remains the same.",
          });
        } else {
          toast({
            title: "Profile updated",
            description: changedFields.length > 3 
              ? `Updated ${changedFields.length} profile fields` 
              : `Updated: ${changedFields.join(', ')}`,
          });
        }
      }
    },
    onError: (error: Error) => {
      // Check for specific error messages
      if (error.message.includes("email is already in use")) {
        toast({
          title: "Email already in use",
          description: "Please use a different email address.",
          variant: "destructive",
        });
        // Focus the email field
        const emailField = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailField) {
          emailField.focus();
        }
      } else if (error.message.includes("valid email")) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        // Focus the email field
        const emailField = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailField) {
          emailField.focus();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile. " + error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      try {
        // First, verify the current password
        const verifyRes = await apiRequest("/api/verify-password", "POST", {
          userId: user.id,
          password: data.currentPassword,
        });
        
        if (verifyRes.error) {
          // Special handling for incorrect current password
          if (verifyRes.error.status === 401) {
            throw new Error("Current password is incorrect");
          }
          throw new Error(verifyRes.error.message || "Failed to verify current password");
        }
        
        // Then change the password
        const res = await apiRequest("/api/change-password", "POST", {
          userId: user.id,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
        
        if (res.error) {
          throw new Error(res.error.message || "Failed to change password");
        }
        
        return res.data;
      } catch (error) {
        console.error("Error changing password:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to change password");
      }
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully. Please use your new password the next time you log in.",
      });
      securityForm.reset();
      
      // In a real app, we might want to invalidate the auth token or refresh it
      // queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      // Check for specific error messages
      if (error.message.includes("Current password is incorrect")) {
        toast({
          title: "Incorrect Password",
          description: "The current password you entered is incorrect. Please try again.",
          variant: "destructive",
        });
        // Focus the current password field
        const currentPasswordField = document.querySelector('input[name="currentPassword"]') as HTMLInputElement;
        if (currentPasswordField) {
          currentPasswordField.focus();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to change password. " + error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Update notification settings mutation
  const notificationMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      try {
        // First, check if notification settings exist for the user
        const checkRes = await apiRequest(`/api/users/${user.id}/notifications`);
        
        // Determine if we need to create or update
        const method = checkRes.data ? "PATCH" : "POST";
        const endpoint = `/api/users/${user.id}/notifications`;
        
        // Track which settings have changed for better user feedback
        const previousSettings = checkRes.data || {
          emailNotifications: true,
          connectionRequests: true,
          messageNotifications: true,
          jobAlerts: true
        };
        
        const changedSettings = Object.entries(data).filter(
          ([key, value]) => previousSettings[key] !== value
        ).map(([key]) => {
          switch(key) {
            case 'emailNotifications': return 'Email notifications';
            case 'connectionRequests': return 'Connection requests';
            case 'messageNotifications': return 'Message notifications';
            case 'jobAlerts': return 'Job alerts';
            default: return key;
          }
        });
        
        const payload = {
          userId: user.id,
          emailNotifications: data.emailNotifications,
          connectionRequests: data.connectionRequests,
          messageNotifications: data.messageNotifications,
          jobAlerts: data.jobAlerts,
        };
        
        const res = await apiRequest(endpoint, method, payload);
        
        if (res.error) {
          throw new Error(res.error.message || "Failed to update notification settings");
        }
        
        return { data: res.data, changedSettings };
      } catch (error) {
        console.error("Notification settings error:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update notification settings");
      }
    },
    onSuccess: (result) => {
      const { changedSettings } = result;
      
      if (changedSettings.length === 0) {
        toast({
          title: "No changes made",
          description: "Your notification preferences remain the same.",
        });
      } else {
        toast({
          title: "Notification preferences updated",
          description: `Updated settings: ${changedSettings.join(', ')}`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "There was an error updating your notification preferences.",
        variant: "destructive",
      });
    },
  });
  
  // Update privacy settings mutation
  const privacyMutation = useMutation({
    mutationFn: async (data: PrivacyFormValues) => {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      try {
        // First, check if privacy settings exist for the user
        const checkRes = await apiRequest(`/api/users/${user.id}/privacy`);
        
        // Determine if we need to create or update
        const method = checkRes.data ? "PATCH" : "POST";
        const endpoint = `/api/users/${user.id}/privacy`;
        
        // Track which settings have changed for better user feedback
        const previousSettings = checkRes.data || {
          profileVisibility: "public",
          showEmail: false,
          showPhone: false,
          allowTagging: true,
          allowMessaging: "everyone",
          searchEngineIndexing: true
        };
        
        const changedSettings = Object.entries(data).filter(
          ([key, value]) => previousSettings[key] !== value
        ).map(([key, value]) => {
          switch(key) {
            case 'profileVisibility': 
              return `Profile visibility: ${value === 'public' ? 'Everyone' : value === 'connections' ? 'Connections only' : 'Private'}`;
            case 'showEmail': 
              return `Email visibility: ${value ? 'Visible' : 'Hidden'}`;
            case 'showPhone': 
              return `Phone visibility: ${value ? 'Visible' : 'Hidden'}`;
            case 'allowTagging': 
              return `Tagging: ${value ? 'Allowed' : 'Disabled'}`;
            case 'allowMessaging': 
              return `Messaging: ${value === 'everyone' ? 'Everyone' : value === 'connections' ? 'Connections only' : 'Disabled'}`;
            case 'searchEngineIndexing': 
              return `Search engine indexing: ${value ? 'Enabled' : 'Disabled'}`;
            default: return key;
          }
        });
        
        const payload = {
          userId: user.id,
          ...data
        };
        
        const res = await apiRequest(endpoint, method, payload);
        
        if (res.error) {
          throw new Error(res.error.message || "Failed to update privacy settings");
        }
        
        return { data: res.data, changedSettings };
      } catch (error) {
        console.error("Privacy settings error:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update privacy settings");
      }
    },
    onSuccess: (result) => {
      const { changedSettings } = result;
      
      if (changedSettings.length === 0) {
        toast({
          title: "No changes made",
          description: "Your privacy settings remain the same.",
        });
      } else {
        toast({
          title: "Privacy settings updated",
          description: changedSettings.length > 2 
            ? `Updated ${changedSettings.length} privacy settings` 
            : `Updated: ${changedSettings.join(', ')}`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "There was an error updating your privacy settings.",
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  // Handle security form submission
  function onSecuritySubmit(data: SecurityFormValues) {
    changePasswordMutation.mutate(data);
  }

  // Handle notification form submission
  const onNotificationSubmit = (data: NotificationFormValues) => {
    notificationMutation.mutate(data);
  };
  
  // Handle privacy form submission
  const onPrivacySubmit = (data: PrivacyFormValues) => {
    privacyMutation.mutate(data);
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle document upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleViewDocument = async (doc: {id: string, name: string, url: string, type: string}) => {
    try {
      // In a real app, we might need to get a fresh URL or check permissions
      // const response = await apiRequest(`/api/documents/${doc.id}/view`);
      // if (response.error) throw new Error(response.error.message);
      // const viewUrl = response.data?.url || doc.url;
      
      // For now, just use the existing URL
      setSelectedDocument(doc);
      setShowDocumentViewer(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to view document.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    const file = files[0];

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress(0);
    setIsUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document', file);
      
      // Upload the file
      const response = await uploadFile(
        `/api/users/${user.id}/documents`, 
        formData, 
        (progress) => setUploadProgress(progress)
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Add the new document to the list
      const newDocument = {
        id: response.data?.id || Date.now().toString(),
        name: file.name,
        url: response.data?.url || URL.createObjectURL(file), // Use URL.createObjectURL as fallback
        type: file.type,
        size: file.size,
        uploadDate: new Date()
      };
      
      setDocuments(prev => [...prev, newDocument]);
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset the file input
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID is required to delete documents.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real app, we would delete from the server
      // const response = await apiRequest(`/api/users/${user.id}/documents/${documentId}`, "DELETE");
      // if (response.error) throw new Error(response.error.message);
      
      // For now, just remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Logout
          </Button>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {user.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-muted-foreground">{user.username}</p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Job title" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your professional title (e.g. Software Engineer)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Your location" {...field} />
                            </FormControl>
                            <FormDescription>
                              City, State or Remote
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself" 
                              className="min-h-32" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description about yourself or your work
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Profile
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter current password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 6 characters, include uppercase and lowercase letters, 
                            a number, and a special character
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {changePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Change Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Controls</CardTitle>
                <CardDescription>
                  Manage who can see your information and how your data is used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...privacyForm}>
                  <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Profile Visibility</h3>
                      
                      <FormField
                        control={privacyForm.control}
                        name="profileVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Who can see your profile?</FormLabel>
                            <FormControl>
                              <select 
                                className="w-full p-2 border border-[#E0E0E0] rounded-md"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="public">Everyone (Public)</option>
                                <option value="connections">Only my connections</option>
                                <option value="private">Only me (Private)</option>
                              </select>
                            </FormControl>
                            <FormDescription>
                              This controls who can view your full profile information
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator className="my-4" />
                      <h3 className="text-lg font-medium">Contact Information</h3>
                      
                      <FormField
                        control={privacyForm.control}
                        name="showEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Show Email Address</FormLabel>
                              <FormDescription>
                                Allow others to see your email address on your profile
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="showPhone"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Show Phone Number</FormLabel>
                              <FormDescription>
                                Allow others to see your phone number on your profile
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Separator className="my-4" />
                      <h3 className="text-lg font-medium">Interactions</h3>
                      
                      <FormField
                        control={privacyForm.control}
                        name="allowTagging"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Tagging</FormLabel>
                              <FormDescription>
                                Allow others to tag you in posts and comments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="allowMessaging"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Who can message you?</FormLabel>
                            <FormControl>
                              <select 
                                className="w-full p-2 border border-[#E0E0E0] rounded-md"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="everyone">Everyone</option>
                                <option value="connections">Only my connections</option>
                                <option value="none">No one</option>
                              </select>
                            </FormControl>
                            <FormDescription>
                              Control who can send you direct messages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator className="my-4" />
                      <h3 className="text-lg font-medium">Search & Discovery</h3>
                      
                      <FormField
                        control={privacyForm.control}
                        name="searchEngineIndexing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Search Engine Visibility</FormLabel>
                              <FormDescription>
                                Allow search engines like Google to index your profile
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={privacyMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {privacyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Privacy Settings"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive activity updates via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="connectionRequests"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Connection Requests</FormLabel>
                            <FormDescription>
                              Notify me when someone sends a connection request
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="messageNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Message Notifications</FormLabel>
                            <FormDescription>
                              Notify me when I receive a new message
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="jobAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Job Alerts</FormLabel>
                            <FormDescription>
                              Receive notifications about new job postings
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      disabled={notificationMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {notificationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Upload and manage your important documents. Supported formats: PDF, Word, JPEG, PNG.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Upload Documents</h3>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange} 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Button 
                      onClick={handleUploadClick}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                  
                  {/* Upload Guidelines */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Upload Guidelines</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 text-sm">
                        <li>Maximum file size: 10MB</li>
                        <li>Supported formats: PDF, Word documents, JPEG, PNG</li>
                        <li>Do not upload sensitive personal information</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
                
                <Separator />
                
                {/* Documents List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Your Documents</h3>
                  
                  {documents.length === 0 ? (
                    <div className="text-center py-8 border rounded-md border-dashed">
                      <File className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500">No documents uploaded yet</p>
                      <Button variant="link" onClick={handleUploadClick} className="mt-2">
                        Upload your first document
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] rounded-md border p-4">
                      <div className="space-y-4">
                        {documents.map(doc => {
                          // Determine icon based on file type
                          let Icon = File;
                          if (doc.type.includes('pdf')) {
                            Icon = File;
                          } else if (doc.type.includes('image')) {
                            Icon = File;
                          } else if (doc.type.includes('word')) {
                            Icon = File;
                          }
                          
                          // Format file size
                          const formatFileSize = (bytes: number) => {
                            if (bytes < 1024) return bytes + ' B';
                            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
                          };
                          
                          return (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="bg-primary/10 p-2 rounded-md">
                                  <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium truncate max-w-[200px]">{doc.name}</p>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>{formatFileSize(doc.size)}</span>
                                    <span>•</span>
                                    <span>{doc.uploadDate.toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDocument(doc)}
                                >
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentViewer} onOpenChange={setShowDocumentViewer}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedDocument?.type.includes('pdf') && <File className="mr-2 h-5 w-5 text-red-500" />}
              {selectedDocument?.type.includes('word') && <File className="mr-2 h-5 w-5 text-blue-500" />}
              {selectedDocument?.type.includes('image') && <File className="mr-2 h-5 w-5 text-green-500" />}
              {selectedDocument?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 h-[500px] overflow-hidden rounded-md border bg-gray-50">
            {selectedDocument && (
              selectedDocument.type.includes('image') ? (
                <img 
                  src={selectedDocument.url} 
                  alt={selectedDocument.name} 
                  className="w-full h-full object-contain"
                />
              ) : selectedDocument.type.includes('pdf') ? (
                <iframe 
                  src={selectedDocument.url} 
                  title={selectedDocument.name}
                  className="w-full h-full"
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <File className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Preview not available for this file type</p>
                  <p className="text-sm text-gray-500">Please download the file to view it</p>
                </div>
              )
            )}
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedDocument?.type} • Last modified: {selectedDocument?.uploadDate?.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDocumentViewer(false)}>
                Close
              </Button>
              <Button asChild>
                <a 
                  href={selectedDocument?.url} 
                  download={selectedDocument?.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}