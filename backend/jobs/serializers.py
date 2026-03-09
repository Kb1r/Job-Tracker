from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):

    class Meta:
        model  = JobApplication
        fields = [
            'id',
            'company_name',
            'job_title',
            'location',
            'salary',
            'status',
            'date_applied',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']