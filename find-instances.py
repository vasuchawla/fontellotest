import os
import re
import argparse
import csv
from typing import List, Dict, Tuple
import subprocess
from html import escape

# === AUTO DISCOVER COMPONENTS ===

def discover_custom_components(root_dir: str) -> List[str]:
    # Match lines like: public struct CustomButton: View
    # or with annotations: @available(...) public struct CustomButton: View
    struct_pattern = re.compile(r'\bstruct\s+(\w+)\s*:\s*View\b')
    func_pattern = re.compile(r'\bfunc\s+(\w+)\s*\(.*\)\s*->\s*some\s+View')

    components = set()

    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.swift'):
                file_path = os.path.join(subdir, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            line = line.strip()
                            # Skip annotations like @available, but allow matching next lines
                            if line.startswith('@'):
                                continue

                            match_struct = struct_pattern.search(line)
                            match_func = func_pattern.search(line)

                            if match_struct:
                                components.add(match_struct.group(1))
                            elif match_func:
                                components.add(match_func.group(1))
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    return list(components)
# === FIND USAGES ===

def find_usages_in_file(file_path: str, components: List[str]) -> List[Tuple[int, str, str]]:
    usages = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines, start=1):
                for component in components:
                    pattern = rf'[\s(]{component}\s*\('
                    if re.search(pattern, line):
                        usages.append((i, line.strip(), component))
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return usages


def scan_directory(root_dir: str, components: List[str], only_git_diff=False) -> Dict[str, List[Tuple[int, str, str]]]:
    results = {}
    files_to_scan = []

    if only_git_diff:
        files_to_scan = get_changed_swift_files(root_dir)
    else:
        for subdir, _, files in os.walk(root_dir):
            for file in files:
                if file.endswith('.swift'):
                    files_to_scan.append(os.path.join(subdir, file))

    for file_path in files_to_scan:
        matches = find_usages_in_file(file_path, components)
        if matches:
            results[file_path] = matches

    return results

# === GIT DIFF SUPPORT ===

def get_changed_swift_files(repo_dir: str) -> List[str]:
    try:
        output = subprocess.check_output(
            ['git', '-C', repo_dir, 'diff', '--name-only', 'HEAD'],
            universal_newlines=True
        )
        return [os.path.join(repo_dir, f) for f in output.splitlines() if f.endswith('.swift')]
    except subprocess.CalledProcessError:
        return []

# === OUTPUT HELPERS ===

def print_results(results: Dict[str, List[Tuple[int, str, str]]]):
    for file_path, matches in results.items():
        print(f"\n📄 {file_path}")
        for line_num, line, component in matches:
            print(f"  {line_num:4}: [{component}] {line}")

def write_csv(results: Dict[str, List[Tuple[int, str, str]]], output_file: str):
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["File", "Line Number", "Component", "Code"])
        for file_path, matches in results.items():
            for line_num, line, component in matches:
                writer.writerow([file_path, line_num, component, line])

def write_html(results: Dict[str, List[Tuple[int, str, str]]], output_file: str):
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("<html><head><title>SwiftUI Component Usages</title></head><body>")
        f.write("<h1>SwiftUI Component Usages</h1>")
        for file_path, matches in results.items():
            f.write(f"<h2>{escape(file_path)}</h2><ul>")
            for line_num, line, component in matches:
                f.write(f"<li><strong>{line_num}</strong>: <em>{component}</em>: <pre>{escape(line)}</pre></li>")
            f.write("</ul>")
        f.write("</body></html>")

# === CLI ENTRY ===

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scan SwiftUI component usages in a Swift project.")
    parser.add_argument("directory", help="Root directory of the Swift project.")
    parser.add_argument("--components", nargs='*', help="Explicit list of component names to search for.")
    parser.add_argument("--auto-discover", action="store_true", help="Auto-discover SwiftUI components.")
    parser.add_argument("--csv", help="Write output to CSV file.")
    parser.add_argument("--html", help="Write output to HTML report.")
    parser.add_argument("--git-diff", action="store_true", help="Only check usages in modified files (via Git).")

    args = parser.parse_args()

    if args.auto_discover:
        print("🔍 Auto-discovering custom components...")
        component_list = discover_custom_components(args.directory)
        print(f"✅ Found components: {component_list}")
    elif args.components:
        component_list = args.components
    else:
        print("❌ Please provide components using --components or enable --auto-discover.")
        exit(1)

    found_usages = scan_directory(args.directory, component_list, only_git_diff=args.git_diff)

    print_results(found_usages)

    if args.csv:
        write_csv(found_usages, args.csv)
        print(f"📄 CSV report written to {args.csv}")

    if args.html:
        write_html(found_usages, args.html)
        print(f"🌐 HTML report written to {args.html}")
