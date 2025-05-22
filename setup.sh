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