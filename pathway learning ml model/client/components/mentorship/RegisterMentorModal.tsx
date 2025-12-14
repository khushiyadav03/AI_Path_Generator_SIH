import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegisterMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | number;
  onSuccess?: () => void;
}

export default function RegisterMentorModal({ open, onOpenChange, userId, onSuccess }: RegisterMentorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    skills: "",
    bio: "",
    experience: "",
    linkedin: "",
    github: "",
    hourly_rate: "",
    availability: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "Please sign in to register as a mentor",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.domain || !formData.bio) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Domain, Bio)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Parse skills from comma-separated string
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const response = await fetch("/api/mentors/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...formData,
          skills: skillsArray,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register as mentor");
      }

      toast({
        title: "Success!",
        description: "You have been registered as a mentor. You will now appear in the mentors list.",
      });

      // Reset form
      setFormData({
        name: "",
        domain: "",
        skills: "",
        bio: "",
        experience: "",
        linkedin: "",
        github: "",
        hourly_rate: "",
        availability: "",
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error registering as mentor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register as mentor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Register as Mentor
          </DialogTitle>
          <DialogDescription>
            Fill in your mentor profile information to help mentees find you
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Your full name"
              required
              className="bg-background/60"
            />
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              Domain <span className="text-red-500">*</span>
            </Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => handleChange("domain", e.target.value)}
              placeholder="e.g., Web Development, Data Science, Machine Learning"
              required
              className="bg-background/60"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
              placeholder="e.g., React, Python, TensorFlow, Docker"
              className="bg-background/60"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell us about yourself and your expertise..."
              rows={4}
              required
              className="bg-background/60"
            />
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              placeholder="Describe your professional experience..."
              rows={3}
              className="bg-background/60"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              type="url"
              className="bg-background/60"
            />
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <Label htmlFor="github">GitHub Profile</Label>
            <Input
              id="github"
              value={formData.github}
              onChange={(e) => handleChange("github", e.target.value)}
              placeholder="https://github.com/yourusername"
              type="url"
              className="bg-background/60"
            />
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
            <Input
              id="hourly_rate"
              value={formData.hourly_rate}
              onChange={(e) => handleChange("hourly_rate", e.target.value)}
              placeholder="e.g., 50"
              type="number"
              min="0"
              step="0.01"
              className="bg-background/60"
            />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input
              id="availability"
              value={formData.availability}
              onChange={(e) => handleChange("availability", e.target.value)}
              placeholder="e.g., Weekdays 9 AM - 5 PM, Weekends flexible"
              className="bg-background/60"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register as Mentor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

