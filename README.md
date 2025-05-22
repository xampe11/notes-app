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
- **Operating System**: Linux (Debian/Ubuntu)

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation/validation
  

## Quick Start

Run the following command to set up and start the application:

```bash
#!/bin/bash
# Setup script for Notes Application on Debian/Ubuntu

echo "🚀 Setting up Notes Application..."

# Check if PostgreSQL is installed and running
if ! command -v psql &> /dev/null; then
    echo "📥 PostgreSQL not found. Installing PostgreSQL..."
    
    # Update package lists
    sudo apt-get update
    
    # Install PostgreSQL
    sudo apt-get install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL service
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    echo "✅ PostgreSQL installed successfully!"
    
    # Create database and user
    echo "🔧 Setting up PostgreSQL user and database..."
    sudo -u postgres psql -c "CREATE USER notesapp WITH PASSWORD 'notesapp';"
    sudo -u postgres psql -c "CREATE DATABASE notesapp OWNER notesapp;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE notesapp TO notesapp;"
    
    # Set DATABASE_URL
    DATABASE_URL='postgresql://notesapp:notesapp@localhost:5432/notesapp'
    
    # Export DATABASE_URL environment variable for current session
    export DATABASE_URL=$DATABASE_URL
    echo "export DATABASE_URL='$DATABASE_URL'" >> ~/.bashrc
    echo "✅ Database URL set to: $DATABASE_URL"
else
    echo "✅ PostgreSQL already installed."
    
    # If DATABASE_URL is not set, use default
    if [ -z "$DATABASE_URL" ]; then
        DATABASE_URL='postgresql://notesapp:notesapp@localhost:5432/notesapp'
        export DATABASE_URL=$DATABASE_URL
        echo "export DATABASE_URL='$DATABASE_URL'" >> ~/.bashrc
        echo "✅ Database URL set to: $DATABASE_URL"
    fi
fi

# Generate JWT_SECRET if not set
if [ -z "$JWT_SECRET" ]; then
    echo "🔑 Generating a secure JWT secret..."
    
    # Generate a random 64-character hex string for JWT_SECRET
    JWT_SECRET=$(head -c 32 /dev/urandom | xxd -p)
    
    # Export JWT_SECRET for current session
    export JWT_SECRET=$JWT_SECRET
    echo "export JWT_SECRET='$JWT_SECRET'" >> ~/.bashrc
    echo "✅ JWT_SECRET has been generated and set."
else
    echo "✅ JWT_SECRET already set."
fi

# Create .env file in back-end directory
echo "📝 Creating .env file in back-end directory..."
# Make sure back-end directory exists
mkdir -p back-end

# Create or overwrite .env file with environment variables
cat > back-end/.env << EOL
# Environment Variables
DATABASE_URL='${DATABASE_URL}'
JWT_SECRET='${JWT_SECRET}'
EOL

echo "✅ .env file created successfully in back-end directory!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

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



## User Guide

- **Register/Login**: Create an account or log in to access the app
- **Create Note**: Click the "New Note" button to create a new note
- **Edit Note**: Click on a note card to edit its content
- **Archive Note**: Click the archive button on a note to move it to the archive
- **Categorize Notes**: Add categories to notes for better organization
- **Filter Notes**: Click on a category in the sidebar to filter notes
- **Change View**: Toggle between grid and list view using the view buttons in the header