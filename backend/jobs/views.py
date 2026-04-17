from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import JobApplication
from .serializers import JobApplicationSerializer

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all().order_by('-date_applied')
    serializer_class = JobApplicationSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            "new":       qs.filter(status='New').count(),
            "applied":   qs.filter(status='Applied').count(),
            "follow_up": qs.filter(status__icontains='Followed up').count(),
            "interview": qs.filter(status__icontains='interview').count(),
            "offer":     qs.filter(status='Offer').count(),
            "rejected":  qs.filter(status__icontains='rejected').count(),
            "total":     qs.count(),
        })

    # This action handles the quick dropdown update
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            job.status = new_status
            job.save()
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)