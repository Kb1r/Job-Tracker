from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def healthz(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('healthz/', healthz, name='healthz'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('jobs.auth_urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serve uploaded media via Django in both dev and prod.
# Caveat: Render's free-tier filesystem is ephemeral — uploads survive only
# until the next deploy/restart. For durable storage, set AWS_STORAGE_BUCKET_NAME
# (Cloudflare R2 works) and django-storages takes over via STORAGES in settings.py.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
