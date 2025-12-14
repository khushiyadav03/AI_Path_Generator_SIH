import { motion } from "framer-motion";
import { Star, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Mentor {
  id: number;
  name: string;
  domain: string;
  bio: string;
  rating: number;
  total_ratings: number;
  total_sessions: number;
  profile_image?: string;
}

interface MentorCardProps {
  mentor: Mentor;
  index: number;
  onMentorClick: () => void;
  onAskForHelp: () => void;
}

export default function MentorCard({ mentor, index, onMentorClick, onAskForHelp }: MentorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass border border-white/20 hover:border-cyan-500/30 transition-all cursor-pointer h-full flex flex-col">
        <CardContent className="p-6 flex-1" onClick={onMentorClick}>
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-cyan-500/30">
              <AvatarImage src={mentor.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400 text-white text-lg">
                {mentor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-1">{mentor.name}</h3>
              <p className="text-sm text-cyan-400 mb-2">{mentor.domain}</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{mentor.rating.toFixed(1)}</span>
                <span className="text-xs text-foreground/60">
                  ({mentor.total_ratings} {mentor.total_ratings === 1 ? "rating" : "ratings"})
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-foreground/70 line-clamp-3 mb-4">
            {mentor.bio || "Experienced mentor ready to help you grow."}
          </p>
          
          {/* Skills */}
          {mentor.skills && Array.isArray(mentor.skills) && mentor.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {mentor.skills.slice(0, 3).map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                >
                  {skill}
                </span>
              ))}
              {mentor.skills.length > 3 && (
                <span className="text-xs px-2 py-1 text-foreground/60">
                  +{mentor.skills.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-foreground/60">
            <span>{mentor.total_sessions || 0} sessions</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onMentorClick();
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            onClick={(e) => {
              e.stopPropagation();
              onAskForHelp();
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask for Help
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

