import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Award, Briefcase, TrendingUp, Users, Zap, BookOpen, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HighlightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const ICON_OPTIONS = [
  { id: "award", icon: <Award className="h-5 w-5" />, label: "Award" },
  { id: "trending", icon: <TrendingUp className="h-5 w-5" />, label: "Trending" },
  { id: "briefcase", icon: <Briefcase className="h-5 w-5" />, label: "Work" },
  { id: "users", icon: <Users className="h-5 w-5" />, label: "Network" },
  { id: "zap", icon: <Zap className="h-5 w-5" />, label: "Skill" },
  { id: "book", icon: <BookOpen className="h-5 w-5" />, label: "Education" },
  { id: "target", icon: <Target className="h-5 w-5" />, label: "Achievement" },
];

export default function HighlightDialog({
  isOpen,
  onClose,
  onSave,
  initialData
}: HighlightDialogProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    title: initialData?.title || "",
    description: initialData?.description || "",
    iconType: initialData?.iconType || "award",
    tags: initialData?.tags || [],
    tagInput: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleIconSelect = (iconType: string) => {
    setFormData(prev => ({ ...prev, iconType }));
  };
  
  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ""
      }));
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the icon component based on the selected icon type
    const selectedIcon = ICON_OPTIONS.find(opt => opt.id === formData.iconType);
    
    onSave({
      id: formData.id,
      title: formData.title,
      description: formData.description,
      iconType: formData.iconType,
      icon: selectedIcon?.icon,
      tags: formData.tags
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Highlight" : "Add Highlight"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update this highlight on your profile." 
              : "Add a new highlight to showcase on your profile."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Award Winner, Top Skill, Recent Achievement"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe this highlight"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map(option => (
                <Button
                  key={option.id}
                  type="button"
                  variant={formData.iconType === option.id ? "default" : "outline"}
                  className={`flex flex-col items-center p-2 h-auto ${
                    formData.iconType === option.id 
                      ? "bg-[#0A66C2] text-white" 
                      : "border-[#E0E0E0] hover:border-[#0A66C2] hover:text-[#0A66C2]"
                  }`}
                  onClick={() => handleIconSelect(option.id)}
                >
                  {React.cloneElement(option.icon as React.ReactElement, { 
                    className: `h-5 w-5 ${formData.iconType === option.id ? "text-white" : ""}` 
                  })}
                  <span className="text-xs mt-1">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex">
              <Input
                id="tagInput"
                name="tagInput"
                value={formData.tagInput}
                onChange={handleChange}
                placeholder="Add a tag and press Enter"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddTag}
                className="ml-2"
              >
                Add
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#E8F3FF] text-[#0A66C2] border-[#0A66C2]"
                  >
                    {tag}
                    <button
                      type="button"
                      className="h-3 w-3 rounded-full bg-[#0A66C2] text-white flex items-center justify-center"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Add Highlight"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}