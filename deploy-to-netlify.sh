#!/bin/bash

# Netlify deployment script for FounderNetwork

echo "Starting Netlify deployment process..."

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install

# Step 2: Build the project
echo "Building the project..."
npm run build

# Step 3: Deploy to Netlify using local CLI
echo "Deploying to Netlify..."
npx netlify deploy --prod

echo "Deployment process completed!"