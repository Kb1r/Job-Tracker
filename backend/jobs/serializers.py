from urllib.parse import urlparse
from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def validate_job_url(self, value):
        if not value:
            return value
        parsed = urlparse(value)
        if parsed.scheme not in ('http', 'https'):
            raise serializers.ValidationError('URL must use http:// or https://')
        return value

    def validate_resume_pdf(self, value):
        if value is None:
            return value
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('File size cannot exceed 5 MB.')
        if hasattr(value, 'content_type') and value.content_type != 'application/pdf':
            raise serializers.ValidationError('Only PDF files are accepted.')
        return value

    def validate_status(self, value):
        valid = [c[0] for c in JobApplication.STATUS_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"'{value}' is not a valid status.")
        return value

    def validate_salary(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Salary must be non-negative.')
        return value
