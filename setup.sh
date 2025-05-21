#!/bin/bash

# Setup script for Notes Application

echo "🚀 Setting up Notes Application..."

# Check if PostgreSQL is installed and running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if DATABASE_URL environment variable is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL environment variable is not set."
    echo "Please set it with your PostgreSQL connection string:"
    echo "export DATABASE_URL='postgresql://username:password@localhost:5432/notesapp'"
    exit 1
fi

# Set up database schema
echo "🗃️ Setting up database schema..."
npm run db:push

# Start the application
echo "🌐 Starting the application..."
npm run dev