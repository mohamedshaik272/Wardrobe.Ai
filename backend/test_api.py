"""
Test script for the Wardrobe.AI backend API
Tests the clothing try-on endpoint without requiring the frontend
"""

import requests
from pathlib import Path
import sys

def test_clothing_tryon_api():
    """Test the clothing try-on API endpoint"""

    # API endpoint
    url = "http://localhost:8000/api/clothing/try-on"

    # Check if test images exist
    print("Looking for test images...")

    # You need to provide test images
    # Example paths - update these to point to your test images
    person_image_path = input("Enter path to person image: ").strip()
    clothing_image_path = input("Enter path to clothing image: ").strip()

    if not Path(person_image_path).exists():
        print(f"Error: Person image not found at {person_image_path}")
        return

    if not Path(clothing_image_path).exists():
        print(f"Error: Clothing image not found at {clothing_image_path}")
        return

    print(f"\nTesting clothing try-on API...")
    print(f"Person image: {person_image_path}")
    print(f"Clothing image: {clothing_image_path}")

    # Prepare files
    files = {
        'person_image': open(person_image_path, 'rb'),
        'clothing_image': open(clothing_image_path, 'rb'),
    }

    # Optional parameters
    data = {
        'num_inference_steps': 30,
        'guidance_scale': 2.0,
        'seed': 42
    }

    try:
        # Make request
        print("\nSending request to API...")
        response = requests.post(url, files=files, data=data)

        # Check response
        if response.status_code == 200:
            result = response.json()
            print(f"\n✓ Success!")
            print(f"Result image saved at: {result['result']}")
        else:
            print(f"\n✗ Error: {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to the API.")
        print("Make sure the backend server is running on http://localhost:8000")
        print("\nTo start the server, run:")
        print("  cd backend")
        print("  python app/main.py")
    except Exception as e:
        print(f"\n✗ Error: {e}")
    finally:
        # Close files
        for f in files.values():
            f.close()

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✓ Server is running")
            return True
        else:
            print("✗ Server returned error")
            return False
    except:
        print("✗ Server is not running")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Wardrobe.AI Backend API Test")
    print("=" * 60)
    print()

    # Test health check first
    print("Checking if server is running...")
    if not test_health_check():
        print("\nPlease start the backend server first:")
        print("  cd backend")
        print("  python app/main.py")
        sys.exit(1)

    print()

    # Test clothing try-on
    test_clothing_tryon_api()

    print("\n" + "=" * 60)
