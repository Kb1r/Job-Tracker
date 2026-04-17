from django.db import models

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

    company_name = models.CharField(max_length=200)
    job_title    = models.CharField(max_length=200)
    job_url      = models.URLField(max_length=500, blank=True, null=True)
    resume_pdf   = models.FileField(upload_to='resumes/', null=True, blank=True)
    location     = models.CharField(max_length=200)
    salary       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status       = models.CharField(max_length=50, choices=STATUS_CHOICES, default='New')
    date_applied = models.DateField()
    notes        = models.TextField(blank=True, default='')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_applied']

    def __str__(self):
        return f"{self.job_title} at {self.company_name}"