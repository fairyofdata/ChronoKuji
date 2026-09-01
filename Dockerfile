FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# Copy app code
COPY . .

# Run DB seeding on startup if test.db does not exist
ENV PORT=8080
EXPOSE 8080

CMD exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
