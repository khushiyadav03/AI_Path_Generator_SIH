from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from .models import Post
from .serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows posts to be viewed or edited.
    """
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    
    # === YEH DO CHEEZEIN ADD KAREIN ===

    # 1. Permission: Pakka karein ki sirf logged-in user hi post bana sakein
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # 2. Logic: Jab naya post save ho, 'author' ko request karne wale user par set kar do
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
