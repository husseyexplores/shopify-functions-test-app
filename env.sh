# Initialize an empty string to store the merged variables
merged_variables=""

# Read the .env file line by line
# while IFS= read -r line; do
while IFS= read -r line || [ -n "$line" ]; do
  # Skip commented lines
  if [[ $line =~ ^[^#]*$ ]]; then
    echo $line
    echo ""
    # Append the variable to the merged_variables string
    merged_variables+=" $line"
  fi
done < $1

# Trim leading and trailing whitespaces from the merged_variables string
merged_variables=${merged_variables## }
merged_variables=${merged_variables%% }

# Set the merged variables using `flyctl` command
# flyctl secrets set "$merged_variables"

# Pipe the merged variables into an arbitrary command
echo "$merged_variables"