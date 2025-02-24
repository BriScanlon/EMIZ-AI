#!/bin/sh
# start.sh - Starts Ollama server and creates the model if missing

set -e

# Start the Ollama server in the background
ollama serve &

# Wait for the server to become available
echo "Waiting for Ollama server to start..."
sleep 5

# Create the model if it doesn't exist
if ! ollama list | grep -q "phi4"; then
  echo "Creating phi4 model with custom parameters..."
  ollama create -f /app/Modelfile phi4
else
  echo "Model phi4 already exists."
fi

# Wait for background Ollama server
wait
