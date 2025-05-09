#!/bin/bash
python3 -m venv venv
# Activate the virtual environment
source venv/bin/activate

# Install dependencies (optional, if you want to ensure they are installed)
pip install -r requirements.txt

# Run the Streamlit app
streamlit run main.py

deactivate
rm -rf venv
