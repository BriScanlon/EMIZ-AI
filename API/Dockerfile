# Base image with CUDA support
FROM nvidia/cuda:11.8.0-runtime-ubuntu20.04

# Set Python version
ARG PYTHON_VERSION=3.9

# Install dependencies and Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    python${PYTHON_VERSION} \
    python3-pip \
    python3-dev \
    swig \
    && rm -rf /var/lib/apt/lists/*

# Set default Python to the specified version
RUN update-alternatives --install /usr/bin/python python /usr/bin/python${PYTHON_VERSION} 1

# Install Python packages
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
WORKDIR /app


# Expose FastAPI default port
EXPOSE 8000

# Entry point for the container
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "3000"]
