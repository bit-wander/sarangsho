# Use official Python image matching pyproject.toml requirement
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install dependencies using uv (with system python, no virtualenv)
RUN uv pip install --system --no-cache -r pyproject.toml
RUN uv pip install --system --no-cache gunicorn

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start FastAPI application using gunicorn with uvicorn workers
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
