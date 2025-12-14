
# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    
    # Define choices for academic year
    YEAR_IN_SCHOOL_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
        # Aap isse aur badha sakte hain (e.g., 5th year)
    ]
    
    # Yeh 'is_senior' ki jagah lega
    academic_year = models.IntegerField(
        choices=YEAR_IN_SCHOOL_CHOICES,
        default=1  # Default value 1st year rakhte hain
    )

    def __str__(self):
        return self.username


class Post(models.Model):
    """
    Model for user posts
    """
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # Newest posts first

    def __str__(self):
        return f"{self.title} by {self.author.username}"