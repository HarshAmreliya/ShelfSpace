#!/usr/bin/env python3
"""
Fix Postman collection to use environment variables instead of collection variables.
This ensures variables persist correctly between requests in Newman.
"""

import json
import sys

def fix_test_script(script_lines):
    """Add environment variable setting alongside collection variables."""
    new_lines = []
    for line in script_lines:
        new_lines.append(line)
        # After setting collection variable, also set environment variable
        if "pm.collectionVariables.set('userToken'" in line:
            new_lines.append("    pm.environment.set('userToken', jsonData.token);")
        elif "pm.collectionVariables.set('userId'" in line:
            new_lines.append("    pm.environment.set('userId', jsonData.user.id);")
    return new_lines

def process_collection(collection):
    """Process the collection and fix variable setting."""
    changes = 0
    
    for item in collection.get('item', []):
        if item.get('name') == 'User Registration & Login':
            for subitem in item.get('item', []):
                if subitem.get('name') in ['Create New User (Sign Up)', 'Login Existing User']:
                    for event in subitem.get('event', []):
                        if event.get('listen') == 'test':
                            script = event.get('script', {})
                            exec_lines = script.get('exec', [])
                            new_lines = fix_test_script(exec_lines)
                            if len(new_lines) != len(exec_lines):
                                script['exec'] = new_lines
                                changes += 1
                                print(f"✓ Fixed: {subitem['name']}")
    
    return changes

def main():
    input_file = 'postman-collection.json'
    output_file = 'postman-collection.json'
    
    try:
        with open(input_file, 'r') as f:
            collection = json.load(f)
        
        print("Fixing Postman collection variable handling...")
        changes = process_collection(collection)
        
        if changes > 0:
            with open(output_file, 'w') as f:
                json.dump(collection, f, indent=2)
            print(f"\n✓ Updated {changes} test scripts")
            print(f"✓ Saved to {output_file}")
        else:
            print("\n✓ No changes needed - collection already fixed")
        
        return 0
    
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(main())
