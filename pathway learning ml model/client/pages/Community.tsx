import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Eye, MessageCircle, ChevronUp, MoreVertical, CheckCircle2, Plus, Heart, Send, Image as ImageIcon, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  content: string;
  date: string;
}

interface Post {
  id: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  authorVerified?: boolean;
  date: string;
  title: string;
  content: string;
  upvotes: number;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked
  views: number;
  comments: number;
  commentsList: Comment[];
  image?: string; // URL or base64 data
  imageFile?: File; // For upload
  category?: string;
}

// Mock data removed - now using API

// PostCard component with view tracking
interface PostCardProps {
  post: Post;
  index: number;
  user: any;
  navigate: any;
  onUpvote: (postId: string) => void;
  onLike: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onOpenDeleteDialog: (postId: string) => void;
  onImageClick: (image: string, postId: string) => void;
  incrementViewCount: (postId: string) => void;
  viewedPosts: Set<string>;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
}

function PostCard({
  post,
  index,
  user,
  navigate,
  onUpvote,
  onLike,
  onOpenComments,
  onOpenDeleteDialog,
  onImageClick,
  incrementViewCount,
  viewedPosts,
  formatDate,
  formatNumber,
}: PostCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Track when post is visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !viewedPosts.has(post.id)) {
            incrementViewCount(post.id);
          }
        });
      },
      { threshold: 0.5 } // Post is considered viewed when 50% is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [post.id, viewedPosts, incrementViewCount]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-xl border border-white/20 p-6 hover:border-cyan-500/30 transition-all"
    >
      <div className="flex gap-4">
        {/* Left: Upvote button */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400"
            onClick={() => onUpvote(post.id)}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-foreground/80">
            {post.upvotes}
          </span>
        </div>

        {/* Center: Post content */}
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-8 w-8 border border-white/20">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400 text-white text-xs">
                {post.author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground/90">
                {post.author}
              </span>
              {post.authorVerified && (
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              )}
              <span className="text-xs text-foreground/60">
                {formatDate(post.date)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-foreground mb-2 hover:text-cyan-400 transition cursor-pointer">
            {post.title}
          </h2>

          {/* Content snippet */}
          <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
            {post.content}
          </p>

          {/* Engagement metrics */}
          <div className="flex items-center gap-4 text-xs text-foreground/60">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 hover:bg-cyan-500/20 hover:text-cyan-400"
              onClick={() => onLike(post.id)}
            >
              <Heart
                className={`h-4 w-4 ${
                  user && post.likedBy.includes(user.id)
                    ? "fill-red-500 text-red-500"
                    : ""
                }`}
              />
              <span>{formatNumber(post.likes)}</span>
            </Button>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(post.views)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 hover:bg-cyan-500/20 hover:text-cyan-400"
              onClick={() => onOpenComments(post.id)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{formatNumber(post.comments)}</span>
            </Button>
          </div>
        </div>

        {/* Right: Image and more options */}
        <div className="flex flex-col items-end gap-2">
          {post.image && (
            <div
              className="relative group cursor-pointer"
              onClick={() => onImageClick(post.image || "", post.id)}
            >
              <img
                src={post.image}
                alt="Post"
                className="h-20 w-20 rounded-lg object-cover border border-white/20 hover:border-cyan-500/50 transition"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 rounded-lg transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              {/* Image icon indicator */}
              <div className="absolute bottom-1 left-1 bg-black/60 rounded p-1">
                <ImageIcon className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
          {/* More options dropdown - show delete if user is author */}
          {user && post.authorId === user.id ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-400"
              onClick={() => onOpenDeleteDialog(post.id)}
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-white/10"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", image: "" as string | null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewedPosts, setViewedPosts] = useState<Set<string>>(new Set());

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?sortBy=${sortBy}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setAllPosts(data.posts || []);
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Fallback to empty array on error
      setAllPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  useEffect(() => {
    // Sort posts based on selected tab
    const sorted = [...allPosts].sort((a, b) => {
      if (sortBy === "votes") {
        return b.upvotes - a.upvotes;
      } else {
        // For newest, sort by date - newest first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
    setPosts(sorted);
  }, [sortBy, allPosts]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Increment view count for a post
  const incrementViewCount = useCallback(async (postId: string) => {
    setViewedPosts((prev) => {
      // Only increment if not already viewed in this session
      if (prev.has(postId)) {
        return prev;
      }
      
      // Make API call to increment view
      fetch(`/api/posts/${postId}/view`, {
        method: "POST",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          if (data) {
            setAllPosts((prevPosts) =>
              prevPosts.map((post) => (post.id === postId ? data.post : post))
            );
          }
        })
        .catch((error) => {
          console.error("Error incrementing view count:", error);
        });
      
      return new Set(prev).add(postId);
    });
  }, []);

  const handleUpvote = async (postId: string) => {
    // Increment view when user interacts
    incrementViewCount(postId);

    try {
      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setAllPosts((prev) =>
          prev.map((post) => (post.id === postId ? data.post : post))
        );
      }
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    // Increment view when user interacts
    incrementViewCount(postId);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setAllPosts((prev) =>
          prev.map((post) => (post.id === postId ? data.post : post))
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleOpenComments = (postId: string) => {
    // Increment view when user opens comments
    incrementViewCount(postId);
    setSelectedPostId(postId);
    setShowCommentsDialog(true);
  };

  const handleAddComment = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (!selectedPostId || !newComment.trim()) {
      return;
    }

    // Increment view when user adds comment
    if (selectedPostId) {
      incrementViewCount(selectedPostId);
    }

    setIsCommenting(true);

    try {
      const response = await fetch(`/api/posts/${selectedPostId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          author: user.displayName || user.email.split("@")[0],
          authorId: user.id,
          authorAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAllPosts((prev) =>
          prev.map((post) => (post.id === selectedPostId ? data.post : post))
        );
        setNewComment("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !postToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Remove post from state
        setAllPosts((prev) => prev.filter((post) => post.id !== postToDelete));
        setShowDeleteDialog(false);
        setPostToDelete(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDeleteDialog = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setNewPost({ ...newPost, image: null });
    // Reset file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          image: imagePreview || undefined,
          author: user.displayName || user.email.split("@")[0],
          authorId: user.id,
          authorAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff`,
          authorVerified: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add new post to the list
        setAllPosts((prev) => [data.post, ...prev]);
        
        // Reset form and close dialog
        setNewPost({ title: "", content: "", image: null });
        setImagePreview(null);
        setImageFile(null);
        setShowCreateDialog(false);

        // Scroll to top to show the new post
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateDialog = () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    setShowCreateDialog(true);
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl mb-2">
        Community
      </h1>
          <p className="text-foreground/70">
            Connect, learn, and share with fellow learners
          </p>
        </div>
        {user && (
          <Button
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as "votes" | "newest")}>
          <TabsList className="glass border border-white/20">
            <TabsTrigger value="votes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20">
              Most Votes
            </TabsTrigger>
            <TabsTrigger value="newest" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20">
              Newest
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-foreground/70">Loading posts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              index={index}
              user={user}
              navigate={navigate}
              onUpvote={handleUpvote}
              onLike={handleLike}
              onOpenComments={handleOpenComments}
              onOpenDeleteDialog={handleOpenDeleteDialog}
              onImageClick={(image, postId) => {
                setSelectedImage(image);
                setShowImageModal(true);
                incrementViewCount(postId);
              }}
              incrementViewCount={incrementViewCount}
              viewedPosts={viewedPosts}
              formatDate={formatDate}
              formatNumber={formatNumber}
            />
          ))}
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      )}

      {/* Empty state if no posts */}
      {posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-foreground/70">No posts yet. Be the first to share!</p>
          {!user && (
            <Button
              onClick={() => navigate("/signin")}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
            >
              Sign in to create a post
            </Button>
          )}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Create New Post
            </DialogTitle>
            <DialogDescription>
              Share your thoughts, ask questions, or help others in the community
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a compelling title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                maxLength={200}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                {newPost.title.length}/200 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your post content here... Be detailed and helpful!"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={6}
                className="bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {newPost.content.length} characters
              </p>
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Image (Optional)</Label>
              {!imagePreview ? (
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="bg-background cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
                />
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-lg border border-white/20 overflow-hidden bg-muted/30">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                          if (imagePreview) {
                            window.open(imagePreview, "_blank");
                          }
                        }}
                        title="View Photo"
                      >
                        <ImageIcon className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                        onClick={handleRemoveImage}
                        title="Remove Image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {imageFile?.name} ({imageFile?.size ? (imageFile.size / 1024).toFixed(1) : 0} KB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const fileInput = document.getElementById("image-upload") as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                      className="text-xs"
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4 border-t border-white/10 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewPost({ title: "", content: "", image: null });
                setImagePreview(null);
                setImageFile(null);
                const fileInput = document.getElementById("image-upload") as HTMLInputElement;
                if (fileInput) {
                  fileInput.value = "";
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.title.trim() || !newPost.content.trim() || isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Comments
            </DialogTitle>
            <DialogDescription>
              {selectedPostId &&
                allPosts.find((p) => p.id === selectedPostId)?.title}
            </DialogDescription>
          </DialogHeader>
          
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[200px] max-h-[400px]">
            {selectedPostId &&
            allPosts.find((p) => p.id === selectedPostId)?.commentsList.length ===
              0 ? (
              <div className="text-center py-8 text-foreground/60">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              selectedPostId &&
              allPosts
                .find((p) => p.id === selectedPostId)
                ?.commentsList.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-white/10"
                  >
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400 text-white text-xs">
                        {comment.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground/90">
                          {comment.author}
                        </span>
                        <span className="text-xs text-foreground/60">
                          {formatDate(comment.date)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t border-white/10 pt-4">
            {user ? (
              <div className="flex gap-2">
                <Avatar className="h-8 w-8 border border-white/20">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-400 text-white text-xs">
                    {(user.displayName || user.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="bg-background resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isCommenting}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-foreground/70 mb-3">
                  Sign in to leave a comment
                </p>
                <Button
                  onClick={() => {
                    setShowCommentsDialog(false);
                    navigate("/signin");
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                >
                  Sign In
                </Button>
              </div>
            )}
            {user && (
              <p className="text-xs text-muted-foreground mt-2">
                Press Ctrl+Enter to submit
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-[90vw] max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImage && (
              <>
                <img
                  src={selectedImage}
                  alt="Full size"
                  className="max-w-full max-h-[95vh] object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white"
                  onClick={() => setShowImageModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-16 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white"
                  onClick={() => {
                    if (selectedImage) {
                      window.open(selectedImage, "_blank");
                    }
                  }}
                  title="Open in new tab"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
