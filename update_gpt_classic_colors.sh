#!/bin/bash

# This script updates the colors of the GPT Classic persona in index.css
# to match the colors of the Einstein, Watts, and Goddard personas

# Define the file path
CSS_FILE="src/index.css"

# Check if the file exists
if [ ! -f "$CSS_FILE" ]; then
  echo "Error: $CSS_FILE does not exist"
  exit 1
fi

# Define the search pattern and replacement
SEARCH=".persona-gpt-classic {
  --persona-color: #22223b;
  --persona-bg: #e0e1dd;
}"

REPLACE=".persona-gpt-classic {
  --persona-color: #EFDCAB;
  --persona-bg: #443627;
}"

# Perform the replacement
sed -i "s/$SEARCH/$REPLACE/g" "$CSS_FILE"

# Check if the replacement was successful
if grep -q "--persona-color: #EFDCAB;" "$CSS_FILE" && grep -q "--persona-bg: #443627;" "$CSS_FILE"; then
  echo "Successfully updated GPT Classic colors in $CSS_FILE"
else
  echo "Failed to update GPT Classic colors in $CSS_FILE"
  exit 1
fi

echo "GPT Classic colors now match Einstein, Watts, and Goddard personas"
