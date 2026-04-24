from django.db import migrations


def delete_orphans(apps, schema_editor):
    JobApplication = apps.get_model('jobs', 'JobApplication')
    JobApplication.objects.filter(owner__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0008_jobapplication_owner'),
    ]

    operations = [
        migrations.RunPython(delete_orphans, migrations.RunPython.noop),
    ]
