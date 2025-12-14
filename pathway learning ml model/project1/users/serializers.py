from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import CustomUser, Post

class CustomRegisterSerializer(RegisterSerializer):
    
    # Hamara custom field
    academic_year = serializers.ChoiceField(choices=CustomUser.YEAR_IN_SCHOOL_CHOICES)

    def get_cleaned_data(self):
        # Default cleaned data (username, email, password1, password2) lein
        data = super().get_cleaned_data()
        
        # Hamara custom field add karein
        data['academic_year'] = self.validated_data.get('academic_year', 1)
        
        return data


class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for Post model
    """
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'author_username', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']