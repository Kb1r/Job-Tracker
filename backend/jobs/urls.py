from django.urls import path, include
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet

def health_check(request):
    return HttpResponse("OK", status=200)

router = DefaultRouter()
router.register(r'', JobApplicationViewSet, basename='jobapplication')

urlpatterns = [
    path('healthz', health_check, name='health-check'),
    path('stats/', JobApplicationViewSet.as_view({'get': 'stats'}), name='job-stats'),
    path('', include(router.urls)),
]