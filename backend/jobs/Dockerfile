# Start from the official Python 3.12 slim image
# "slim" means minimal OS — smaller and faster than the full image
FROM python:3.12-slim

# Set environment variables
# Prevents Python from writing .pyc files (we don't need them in Docker)
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python from buffering stdout/stderr (logs appear immediately)
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Copy requirements first (before copying all code)
# This is a Docker optimisation: if requirements haven't changed,
# Docker reuses the cached layer and skips reinstalling packages
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Now copy the rest of the application code
COPY . .

# Expose port 8000 so other containers (and your Mac) can reach Django
EXPOSE 8000

# The command to run when the container starts
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]