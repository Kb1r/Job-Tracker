from rest_framework import serializers
from .models import JobApplication
from urllib.parse import urlparse

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'

    # URL Scheme Validation
    def validate_job_url(self, value):
        if value:
            parsed = urlparse(value)
            if parsed.scheme not in ['http', 'https']:
                raise serializers.ValidationError("URL must start with http or https")
        return value

    # Extra content-type check for the API layer
    def validate_resume_pdf(self, value):
        if value:
            # Check MIME type
            if hasattr(value, 'content_type') and value.content_type != 'application/pdf':
                raise serializers.ValidationError("Only PDF documents are allowed.")
            # Size check (redundant but good for immediate API feedback)
            if value.size > 5242880:
                raise serializers.ValidationError("File size exceeds 5MB limit.")
        return value

    #Choice Validation
    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in JobApplication.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"'{value}' is not a valid status.")
        return value