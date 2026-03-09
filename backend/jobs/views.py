from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from .models import JobApplication
from .serializers import JobApplicationSerializer


class JobApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        queryset = JobApplication.objects.all()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class JobApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset         = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer


@api_view(['GET'])
def stats_view(request):
    totals = JobApplication.objects.values('status').annotate(count=Count('id'))
    result = {item['status']: item['count'] for item in totals}
    return Response({
        'Applied':   result.get('Applied',   0),
        'Interview': result.get('Interview', 0),
        'Offer':     result.get('Offer',     0),
        'Rejected':  result.get('Rejected',  0),
        'total':     JobApplication.objects.count(),
    })