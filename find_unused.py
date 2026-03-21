import os
import re

def find_unused():
    src_dir = 'frontend/src'
    all_files = []
    
    # Get all ts/tsx files
    for root, dirs, files in os.walk(src_dir):
        for f in files:
            if f.endswith(('.ts', '.tsx')):
                full_path = os.path.join(root, f)
                all_files.append(full_path)
                
    # Check each file if its basename (without ext) is mentioned in any other file
    unused = []
    for target in all_files:
        basename = os.path.splitext(os.path.basename(target))[0]
        # skip App, main, client, index since they are standard or entry
        if basename in ['App', 'main', 'client', 'index', 'generation', 'vite-env.d']:
            continue
            
        is_used = False
        for f in all_files:
            if f == target:
                continue
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
                if basename in content:
                    is_used = True
                    break
                    
        if not is_used:
            unused.append(target)
            
    print("Unused files:")
    for u in unused:
        print(u)

find_unused()
