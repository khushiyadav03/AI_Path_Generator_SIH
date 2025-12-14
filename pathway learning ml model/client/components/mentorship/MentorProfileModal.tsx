import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Linkedin, Github, Calendar, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Mentor {
  id: number;
  name: string;
  domain: string;
  skills?: string[];
  bio: string;
  experience: string;
  rating: number;
  total_ratings: number;
  linkedin?: string;
  github?: string;
  profile_image?: string;
  hourly_rate?: number;
  availability?: string;
  upcomingBookings?: any[];
  recentFeedback?: any[];
}

interface MentorProfileModalProps {
  mentor: Mentor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSession: () => void;
}

export default function MentorProfileModal({ mentor, open, onOpenChange, onBookSession }: MentorProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent text-2xl">
            Mentor Profile
          </DialogTitle>
          <DialogDescription>Learn more about this mentor</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-2 border-cyan-500/30">
              <AvatarImage src={mentor.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400 text-white text-2xl">
                {mentor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{mentor.name}</h2>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-3">
                {mentor.domain}
              </Badge>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold">{mentor.rating.toFixed(1)}</span>
                <span className="text-sm text-foreground/60">
                  ({mentor.total_ratings} {mentor.total_ratings === 1 ? "rating" : "ratings"})
                </span>
              </div>
              <div className="flex gap-4 text-sm text-foreground/70">
                {mentor.hourly_rate && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${mentor.hourly_rate}/hr</span>
                  </div>
                )}
                {mentor.availability && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{mentor.availability}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(mentor.linkedin || mentor.github) && (
            <div className="flex gap-3">
              {mentor.linkedin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(mentor.linkedin, "_blank")}
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              )}
              {mentor.github && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(mentor.github, "_blank")}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              )}
            </div>
          )}

          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-foreground/80">{mentor.bio || "No bio available."}</p>
          </div>

          {/* Skills */}
          {mentor.skills && Array.isArray(mentor.skills) && mentor.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {mentor.experience && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Experience</h3>
              <p className="text-foreground/80">{mentor.experience}</p>
            </div>
          )}

          {/* Recent Feedback */}
          {mentor.recentFeedback && mentor.recentFeedback.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Feedback</h3>
              <div className="space-y-3">
                {mentor.recentFeedback.slice(0, 3).map((feedback: any) => (
                  <div key={feedback.id} className="glass rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{feedback.user_name}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-foreground/70">{feedback.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            onClick={onBookSession}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

