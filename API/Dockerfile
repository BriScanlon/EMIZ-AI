# Base image with CUDA support
FROM nvidia/cuda:11.8.0-runtime-ubuntu20.04

# Set Python version
ARG PYTHON_VERSION=3.9

# Install Python 3.9 and pip dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python${PYTHON_VERSION} \
    python${PYTHON_VERSION}-distutils \
    python3-pip \
    python3-dev \
    swig \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Ensure pip is installed and updated for Python 3.9
RUN wget https://bootstrap.pypa.io/get-pip.py && python${PYTHON_VERSION} get-pip.py && rm get-pip.py
RUN python${PYTHON_VERSION} -m pip install --upgrade pip setuptools

# Set default Python to 3.9
RUN update-alternatives --install /usr/bin/python python /usr/bin/python${PYTHON_VERSION} 1 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1

# Confirm correct Python and pip versions
RUN python --version && python -m pip --version

# Install specific neo4j-graphrag version with optional ollama support
RUN python -m pip install neo4j-graphrag==1.4.2
RUN python -m pip install "neo4j-graphrag[ollama]"

# Copy application requirements and install dependencies
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --no-cache-dir -r /app/requirements.txt

# Set the working directory
WORKDIR /app

# Expose FastAPI default port
EXPOSE 3000

# Entry point for the container
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "3000"]
