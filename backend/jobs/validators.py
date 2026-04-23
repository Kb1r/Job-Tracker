from django.core.exceptions import ValidationError

MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_pdf_size(file):
    if file.size > MAX_UPLOAD_SIZE:
        raise ValidationError(
            f'File size cannot exceed {MAX_UPLOAD_SIZE // (1024 * 1024)} MB.'
        )
