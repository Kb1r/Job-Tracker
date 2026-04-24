from django.conf import settings
from django.db import models
from django.core.validators import FileExtensionValidator
from .validators import validate_pdf_size

# Re-export so migration 0007 (which references jobs.models.validate_pdf_size) keeps working.
__all__ = ['validate_pdf_size', 'JobApplication']


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('New', 'New'),
        ('Applied', 'Applied'),
        ('Followed up (1)', 'Followed up (1)'),
        ('Followed up (2)', 'Followed up (2)'),
        ('Followed up (3)', 'Followed up (3)'),
        ('Followed up (4)', 'Followed up (4)'),
        ('Invited to first interview', 'Invited to first interview'),
        ('Invited to second interview', 'Invited to second interview'),
        ('Technical Test', 'Technical Test'),
        ('Offer', 'Offer'),
        ('Rejected', 'Rejected'),
        ('Rejected after first interview', 'Rejected after first interview'),
        ('Closed / No interest', 'Closed / No interest'),
        ('No response', 'No response'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs',
    )

    company_name = models.CharField(max_length=200)
    job_title    = models.CharField(max_length=200)
    job_url      = models.URLField(max_length=500, blank=True, null=True)
    resume_pdf   = models.FileField(
        upload_to='resumes/',
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf']),
            validate_pdf_size,
        ],
    )
    location     = models.CharField(max_length=200)
    salary       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status       = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='New',
        db_index=True,
    )
    date_applied = models.DateField(db_index=True)
    notes        = models.TextField(blank=True, default='')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_applied']

    def __str__(self):
        return f'{self.job_title} at {self.company_name}'
