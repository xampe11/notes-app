# Notes Application

A full-stack notes application with robust authentication, CRUD operations, and advanced note management capabilities built with modern web technologies.

## Features

- User authentication with JWT
- Create, read, update, and delete notes
- Archive/unarchive notes
- Categorize notes with multiple categories
- Filter notes by category
- Responsive design with dark mode support
- Grid and list view options

## Tech Stack

- **Frontend**: React, Redux, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **State Management**: React Query & Redux
- **Authentication**: JWT

## Quick Start

Run the following command to set up and start the application:

```bash
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
```

Save this as `setup.sh` in the project root, then make it executable:

```bash
chmod +x setup.sh
```

Then run it with:

```bash
./setup.sh
```

## Manual Setup

If you prefer manual setup:

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database environment variable:
   ```
   export DATABASE_URL='postgresql://username:password@localhost:5432/notesapp'
   ```

3. Push the database schema:
   ```
   npm run db:push
   ```

4. Start the application:
   ```
   npm run dev
   ```

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation/validation

## User Guide

- **Register/Login**: Create an account or log in to access the app
- **Create Note**: Click the "New Note" button to create a new note
- **Edit Note**: Click on a note card to edit its content
- **Archive Note**: Click the archive button on a note to move it to the archive
- **Categorize Notes**: Add categories to notes for better organization
- **Filter Notes**: Click on a category in the sidebar to filter notes
- **Change View**: Toggle between grid and list view using the view buttons in the header