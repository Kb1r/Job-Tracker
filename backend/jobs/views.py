from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import JobApplication
from .serializers import JobApplicationSerializer

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all().order_by('-date_applied')
    serializer_class = JobApplicationSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        4.2: Optimized stats query using a single aggregate call.
        4.3: Keys now match the frontend Stats type exactly.
        """
        stats_data = JobApplication.objects.aggregate(
            new=Count('id', filter=Q(status='New')),
            applied=Count('id', filter=Q(status='Applied')),
            follow_up=Count('id', filter=Q(status__icontains='Followed up')),
            interview=Count('id', filter=Q(status__icontains='interview') | Q(status='Technical Test')),
            offer=Count('id', filter=Q(status='Offer')),
            rejected=Count('id', filter=Q(status__icontains='rejected')),
            total=Count('id')
        )
        return Response(stats_data)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        4.1: Validates new_status against choices before saving.
        """
        job = self.get_object()
        new_status = request.data.get('status')
        
        # Validate against model choices
        valid_statuses = [c[0] for c in JobApplication.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status: {new_status}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        job.status = new_status
        job.save()
        return Response({'status': 'success'})