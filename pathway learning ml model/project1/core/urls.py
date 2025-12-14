from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import PostViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth URLs
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # API URLs
    path('api/', include(router.urls)),
]