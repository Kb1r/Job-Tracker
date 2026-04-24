from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet

router = DefaultRouter()
router.register(r'', JobApplicationViewSet, basename='jobapplication')

urlpatterns = [
    path('stats/', JobApplicationViewSet.as_view({'get': 'stats'}), name='job-stats'),
    path('', include(router.urls)),
]
