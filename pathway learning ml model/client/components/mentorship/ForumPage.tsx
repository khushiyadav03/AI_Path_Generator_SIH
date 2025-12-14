import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ForumPageProps {
  userId?: string | number;
}

export default function ForumPage({ userId }: ForumPageProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newPost, setNewPost] = useState({ topic: "", content: "", tags: "" });
  const [newComment, setNewComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await fetch(`/api/forum?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!userId || !newPost.topic || !newPost.content) return;

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          ...newPost,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");
      
      setShowCreateDialog(false);
      setNewPost({ topic: "", content: "", tags: "" });
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!userId || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/forum/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forumId: postId,
          userId: Number(userId),
          content: newComment.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to add comment");
      
      setNewComment("");
      if (selectedPost) {
        fetchPostDetails(postId);
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchPostDetails = async (postId: number) => {
    try {
      const response = await fetch(`/api/forum/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      const data = await response.json();
      setSelectedPost(data.post);
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const handleUpvote = async (postId: number) => {
    try {
      await fetch(`/api/forum/${postId}/upvote`, { method: "POST" });
      fetchPosts();
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
          Discussion Forum
        </h2>
        {userId && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
        <Input
          placeholder="Search forum posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background/60"
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="glass border border-white/20 p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
          <p className="text-foreground/70">No posts yet. Be the first to start a discussion!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="glass border border-white/20 hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={() => {
                fetchPostDetails(post.id);
                setSelectedPost({ ...post, comments: [] });
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{post.topic}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-foreground/60">
                      <span>{post.author_name}</span>
                      <span>•</span>
                      <span>{format(new Date(post.created_at), "PPP")}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpvote(post.id);
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {post.upvotes}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 line-clamp-3 mb-3">{post.content}</p>
                <div className="flex items-center gap-2">
                  {post.tags && (
                    <Badge variant="outline" className="text-xs">
                      {post.tags}
                    </Badge>
                  )}
                  <span className="text-xs text-foreground/60">
                    {post.comment_count || 0} comments • {post.views || 0} views
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>Share your question or topic with the community</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={newPost.topic}
                onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
                placeholder="Enter post topic..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Write your post content..."
                rows={6}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                placeholder="e.g., React, JavaScript, Career"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Details Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost.topic}</DialogTitle>
              <DialogDescription>
                by {selectedPost.author_name} • {format(new Date(selectedPost.created_at), "PPP")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-foreground/80 whitespace-pre-wrap">{selectedPost.content}</p>
              
              <div>
                <h4 className="font-semibold mb-3">Comments ({selectedPost.comments?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedPost.comments?.map((comment: any) => (
                    <div key={comment.id} className="glass rounded-lg p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{comment.author_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{comment.author_name}</span>
                        <span className="text-xs text-foreground/60">
                          {format(new Date(comment.created_at), "PPP")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {userId && (
                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAddComment(selectedPost.id)}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

