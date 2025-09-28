#!/usr/bin/env python3
"""
Final verification script for BibleTexts.com modern website setup
"""

import os
import sys
from pathlib import Path
import subprocess

def check_file_exists(file_path, description):
    """Check if a file exists and report status"""
    if Path(file_path).exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ Missing {description}: {file_path}")
        return False

def check_script_execution(script_path, description):
    """Check if a script can be executed"""
    try:
        result = subprocess.run([sys.executable, script_path, '--help'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ {description}: {script_path}")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} error: {e}")
        return False

def main():
    """Main verification function"""
    print("🔍 BibleTexts.com Setup Verification")
    print("=" * 50)
    
    all_good = True
    
    # Check essential files
    print("\n📁 Checking essential files...")
    all_good &= check_file_exists("convert_html.py", "HTML conversion script")
    all_good &= check_file_exists("setup.py", "Main setup script")
    all_good &= check_file_exists("build_search_index.py", "Search index builder")
    all_good &= check_file_exists("requirements.txt", "Python dependencies")
    all_good &= check_file_exists("README.md", "Documentation")
    all_good &= check_file_exists(".gitignore", "Git ignore file")
    
    # Check assets
    print("\n🎨 Checking assets...")
    all_good &= check_file_exists("css/modern-styles.css", "Modern CSS")
    all_good &= check_file_exists("js/modern-features.js", "Modern JavaScript")
    all_good &= check_file_exists("js/search.js", "Search functionality")
    
    # Check script execution
    print("\n⚙️ Checking script execution...")
    all_good &= check_script_execution("convert_html.py", "HTML converter")
    all_good &= check_script_execution("setup.py", "Setup script")
    all_good &= check_script_execution("build_search_index.py", "Search index builder")
    
    # Check dependencies
    print("\n📦 Checking dependencies...")
    try:
        from bs4 import BeautifulSoup
        print("✅ BeautifulSoup4 available")
    except ImportError:
        print("❌ BeautifulSoup4 not available - run: pip install -r requirements.txt")
        all_good = False
    
    try:
        import lxml
        print("✅ lxml available")
    except ImportError:
        print("❌ lxml not available - run: pip install -r requirements.txt")
        all_good = False
    
    print("\n" + "=" * 50)
    
    if all_good:
        print("🎉 All systems ready!")
        print("\n📋 Next steps:")
        print("   1. Get your source HTML files")
        print("   2. Run: python3 setup.py /path/to/source/files")
        print("   3. git add .")
        print("   4. git commit -m 'Modern BibleTexts.com with search'")
        print("   5. git push origin main")
        print("   6. Enable GitHub Pages in repository settings")
        return 0
    else:
        print("❌ Some issues found. Please fix them before proceeding.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
