from django.db import models


class JobApplication(models.Model):

    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Interview', 'Interview'),
        ('Offer', 'Offer'),
        ('Rejected', 'Rejected'),
    ]

    company_name = models.CharField(max_length=200)
    job_title    = models.CharField(max_length=200)
    location     = models.CharField(max_length=200)
    salary       = models.DecimalField(
                       max_digits=10, decimal_places=2,
                       null=True, blank=True)
    status       = models.CharField(
                       max_length=20,
                       choices=STATUS_CHOICES,
                       default='Applied')
    date_applied = models.DateField()
    notes        = models.TextField(blank=True, default='')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_applied']

    def __str__(self):
        return f"{self.job_title} at {self.company_name}"