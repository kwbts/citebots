#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Brief Generator Server Startup Script${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check if the .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. Creating a sample one...${NC}"
  
  cat > .env << EOL
# Supabase Configuration
SUPABASE_URL=https://trmaeodthlywcjwfzdka.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# API Keys for LLM Services
OPENAI_API_KEY=your_openai_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here
CLAUDE_API_KEY=your_claude_key_here
GOOGLE_SEARCH_API_KEY=your_google_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
SCRAPINGBEE_API_KEY=your_scrapingbee_key_here

# Server Configuration
BRIEF_GENERATOR_PORT=3001

# Feature Flags
USE_MOCK_PERPLEXITY=true
USE_MOCK_SCRAPING=true
EOL
  
  echo -e "${YELLOW}Sample .env file created. Please edit it with your actual API keys.${NC}"
  echo -e "${YELLOW}You can start the server after editing the file.${NC}"
  exit 1
fi

# Function to check if a required environment variable is set
check_env_var() {
  VAR_NAME=$1
  OPTIONAL=$2
  
  if grep -q "^$VAR_NAME=" .env; then
    # Get variable value from .env file
    VAR_VALUE=$(grep "^$VAR_NAME=" .env | cut -d '=' -f2-)
    
    # Check if the value is empty or still contains a placeholder
    if [ -z "$VAR_VALUE" ] || [[ "$VAR_VALUE" == *"your_"*"_here" ]]; then
      if [ "$OPTIONAL" == "optional" ]; then
        echo -e "${YELLOW}⚠️  Warning: $VAR_NAME is not set in .env file (optional)${NC}"
      else
        echo -e "${RED}❌ Error: $VAR_NAME is not set in .env file${NC}"
        MISSING_VARS=1
      fi
    else
      echo -e "${GREEN}✓ $VAR_NAME is set${NC}"
    fi
  else
    if [ "$OPTIONAL" == "optional" ]; then
      echo -e "${YELLOW}⚠️  Warning: $VAR_NAME is missing from .env file (optional)${NC}"
    else
      echo -e "${RED}❌ Error: $VAR_NAME is missing from .env file${NC}"
      MISSING_VARS=1
    fi
  fi
}

echo -e "${BLUE}Checking environment variables...${NC}"

MISSING_VARS=0

# Required variables
check_env_var "SUPABASE_URL"
check_env_var "SUPABASE_SERVICE_KEY"

# At least one of these LLM services should be available
check_env_var "OPENAI_API_KEY"
check_env_var "CLAUDE_API_KEY" "optional"
check_env_var "PERPLEXITY_API_KEY" "optional"
check_env_var "GOOGLE_SEARCH_API_KEY" "optional"
check_env_var "SCRAPINGBEE_API_KEY" "optional"

# Other variables
check_env_var "BRIEF_GENERATOR_PORT" "optional"
check_env_var "USE_MOCK_PERPLEXITY" "optional"
check_env_var "USE_MOCK_SCRAPING" "optional"

# Check if there are missing required variables
if [ $MISSING_VARS -ne 0 ]; then
  echo -e "\n${RED}There are missing required environment variables. Please update your .env file.${NC}"
  exit 1
fi

echo -e "\n${GREEN}Environment variables check passed!${NC}"

# Check for required node modules
echo -e "\n${BLUE}Checking for required Node.js modules...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Node modules not found. Installing dependencies...${NC}"
  npm install
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Please check npm output.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Dependencies installed successfully.${NC}"
else
  echo -e "${GREEN}Node modules found.${NC}"
fi

# Run database check script
echo -e "\n${BLUE}Checking for existing briefs in the database...${NC}"
node check-briefs.js

# Start the server
echo -e "\n${BLUE}Starting Brief Generator server...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"

node server.js