#!/bin/bash
# Script to push the CRM project to GitHub portfolio repository

# Set the project name
PROJECT_NAME="CRM"

# Set up a temporary directory for the operation
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Clone the portfolio repository
echo "Cloning your portfolio repository..."
git clone https://github.com/paulocymbaum/portfolio.git $TEMP_DIR
if [ $? -ne 0 ]; then
  echo "Failed to clone repository. Make sure the URL is correct and you have access."
  exit 1
fi

# Create a new branch for the update
cd $TEMP_DIR
git checkout -b add-crm-project

# Create a directory for the CRM project
mkdir -p $PROJECT_NAME

# Copy all project files (excluding git, venv, and other unnecessary files)
echo "Copying project files..."
rsync -av --exclude='venv' --exclude='.git' --exclude='__pycache__' --exclude='*.pyc' \
  --exclude='uploaded_data.csv' --exclude='.env' --exclude='.DS_Store' \
  "/home/paulo-yapper/Documents/Documentacao Dev/CRM/" "$TEMP_DIR/$PROJECT_NAME/"

# Add all files to git
git add .

# Commit the changes
git commit -m "Add CRM Financial and Product Analysis App to portfolio"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin add-crm-project

# Print next steps
echo "===============================================================================================
NEXT STEPS:

1. Visit: https://github.com/paulocymbaum/portfolio/pull/new/add-crm-project
2. Create a pull request to merge the 'add-crm-project' branch into 'main'
3. After reviewing the changes, merge the pull request to update your portfolio

If you're prompted for GitHub credentials, enter your username and personal access token.
If you don't have a personal access token, you can create one at:
https://github.com/settings/tokens
===============================================================================================
"

# Cleanup
echo "Temporary directory will remain at $TEMP_DIR for your reference."
echo "You can delete it manually when you no longer need it."
