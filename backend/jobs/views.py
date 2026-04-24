from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import JobApplication
from .serializers import JobApplicationSerializer


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        return JobApplication.objects.filter(owner=self.request.user).order_by('-date_applied')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

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
        serializer = self.get_serializer(job, data={'status': request.data.get('status')}, partial=True)
        serializer.is_valid(raise_exception=True)
        job.status = serializer.validated_data['status']
        job.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(job).data)
