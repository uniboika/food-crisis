#!/bin/bash

# Script to update all color values in CSS files

echo "Starting color replacement in all CSS files..."

# Find all CSS files
find ./food-crisis/wp-content -name "*.css" -type f | while read file; do
    echo "Processing: $file"
    
    # Replace old teal/green primary colors with new blue
    sed -i '' 's/#006450/#3753a4/g' "$file"
    sed -i '' 's/#00a669/#3753a4/g' "$file"
    sed -i '' 's/#00A669/#3753a4/g' "$file"
    sed -i '' 's/#003C3B/#1F2E5C/g' "$file"
    sed -i '' 's/#0B4D3C/#2A3F7A/g' "$file"
    
    # Replace old orange/yellow accent colors with new green
    sed -i '' 's/#ED8836/#a1cd43/g' "$file"
    sed -i '' 's/#FFA765/#a1cd43/g' "$file"
    sed -i '' 's/#FFD44A/#C4E078/g' "$file"
    sed -i '' 's/#E4C06D/#C4E078/g' "$file"
    sed -i '' 's/#843700/#7FA32F/g' "$file"
    
    # Replace background colors
    sed -i '' 's/#F3EAE2/#E8EDF7/g' "$file"
    sed -i '' 's/#E9F0E7/#E8F4D9/g' "$file"
done

echo "CSS color replacement complete!"
