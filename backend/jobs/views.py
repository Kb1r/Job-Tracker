from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import JobApplication
from .serializers import JobApplicationSerializer

# Build once at import time rather than on every request.
VALID_STATUSES = frozenset(c[0] for c in JobApplication.STATUS_CHOICES)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        # TODO: Once frontend auth is live, replace with the filtered version below
        # and flip DEFAULT_PERMISSION_CLASSES to IsAuthenticated in settings.py.
        #   return JobApplication.objects.filter(owner=self.request.user).order_by('-date_applied')
        return JobApplication.objects.all().order_by('-date_applied')

    def perform_create(self, serializer):
        owner = self.request.user if self.request.user.is_authenticated else None
        serializer.save(owner=owner)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        stats_data = qs.aggregate(
            new=Count('id', filter=Q(status='New')),
            applied=Count('id', filter=Q(status='Applied')),
            follow_up=Count('id', filter=Q(status__icontains='Followed up')),
            interview=Count('id', filter=Q(status__icontains='interview') | Q(status='Technical Test')),
            offer=Count('id', filter=Q(status='Offer')),
            rejected=Count('id', filter=Q(status__icontains='rejected')),
            total=Count('id'),
        )
        return Response(stats_data)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')
        if new_status not in VALID_STATUSES:
            return Response(
                {'status': [f'Invalid status: {new_status}']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        job.status = new_status
        job.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(job).data)
