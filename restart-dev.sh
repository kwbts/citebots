#!/bin/bash
echo "Clearing Nuxt cache..."
rm -rf .nuxt
rm -rf .output
rm -rf node_modules/.vite

echo "Restarting development server..."
npm run dev