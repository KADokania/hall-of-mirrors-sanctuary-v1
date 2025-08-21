import requests
import sys
import time
from datetime import datetime

class HallOfMirrorsAPITester:
    def __init__(self, base_url="https://reflection-spiral.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {response_data}")
                    return success, response_data
                except:
                    print(f"Response: {response.text[:200]}")
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )

    def test_create_status_check(self):
        """Test creating a status check"""
        test_data = {
            "client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"
        }
        return self.run_test(
            "Create Status Check",
            "POST",
            "api/status",
            200,
            data=test_data
        )

    def test_get_status_checks(self):
        """Test getting all status checks"""
        return self.run_test(
            "Get Status Checks",
            "GET",
            "api/status",
            200
        )

    def test_create_first_session(self):
        """Test creating first session (should unlock 3 blooms)"""
        test_data = {
            "total_sessions": 1
        }
        success, response = self.run_test(
            "Create First Session (3 blooms)",
            "POST",
            "api/sessions",
            200,
            data=test_data
        )
        
        if success and response:
            session_id = response.get('id')
            if session_id:
                self.session_ids.append(session_id)
                # Verify 3 blooms unlocked
                if response.get('blooms_unlocked') == 3:
                    print("✅ Correctly unlocked 3 blooms for first session")
                else:
                    print(f"❌ Expected 3 blooms, got {response.get('blooms_unlocked')}")
                    return False, response
            return success, response
        return False, {}

    def test_create_second_session(self):
        """Test creating second session (should unlock 5 blooms)"""
        test_data = {
            "total_sessions": 2
        }
        success, response = self.run_test(
            "Create Second Session (5 blooms)",
            "POST",
            "api/sessions",
            200,
            data=test_data
        )
        
        if success and response:
            session_id = response.get('id')
            if session_id:
                self.session_ids.append(session_id)
                # Verify 5 blooms unlocked
                if response.get('blooms_unlocked') == 5:
                    print("✅ Correctly unlocked 5 blooms for second session")
                else:
                    print(f"❌ Expected 5 blooms, got {response.get('blooms_unlocked')}")
                    return False, response
            return success, response
        return False, {}

    def test_create_third_session(self):
        """Test creating third session (should unlock all 8 blooms)"""
        test_data = {
            "total_sessions": 3
        }
        success, response = self.run_test(
            "Create Third Session (8 blooms)",
            "POST",
            "api/sessions",
            200,
            data=test_data
        )
        
        if success and response:
            session_id = response.get('id')
            if session_id:
                self.session_ids.append(session_id)
                # Verify 8 blooms unlocked
                if response.get('blooms_unlocked') == 8:
                    print("✅ Correctly unlocked all 8 blooms for third+ session")
                else:
                    print(f"❌ Expected 8 blooms, got {response.get('blooms_unlocked')}")
                    return False, response
            return success, response
        return False, {}

    def test_get_session(self, session_id):
        """Test retrieving a session by ID"""
        return self.run_test(
            f"Get Session {session_id[:8]}...",
            "GET",
            f"api/sessions/{session_id}",
            200
        )

    def test_mirror_reflection_hopeful(self):
        """Test Mirror reflection with hopeful journal text"""
        if not self.session_ids:
            print("❌ No session ID available for Mirror test")
            return False, {}
            
        test_data = {
            "session_id": self.session_ids[0],
            "bloom_id": "B1",
            "journal_text": "I feel hopeful today, like something beautiful is emerging in my life. There's a lightness in my chest that wasn't there yesterday.",
            "user_history": []
        }
        
        print("⏳ Testing Mirror reflection (this may take a few seconds for LLM response)...")
        success, response = self.run_test(
            "Mirror Reflection - Hopeful Tone",
            "POST",
            "api/mirror/reflect",
            200,
            data=test_data
        )
        
        if success and response:
            # Check if response has expected fields
            if 'text' in response and 'tone_tags' in response:
                print("✅ Mirror response has required fields")
                print(f"Mirror text: {response['text'][:100]}...")
                print(f"Tone tags: {response['tone_tags']}")
            else:
                print("❌ Mirror response missing required fields")
                return False, response
        
        return success, response

    def test_mirror_reflection_anxious(self):
        """Test Mirror reflection with anxious journal text"""
        if not self.session_ids:
            print("❌ No session ID available for Mirror test")
            return False, {}
            
        test_data = {
            "session_id": self.session_ids[0],
            "bloom_id": "B2",
            "journal_text": "I'm feeling really anxious and restless today. My mind keeps racing and I can't seem to find peace anywhere.",
            "user_history": []
        }
        
        print("⏳ Testing Mirror reflection (this may take a few seconds for LLM response)...")
        success, response = self.run_test(
            "Mirror Reflection - Anxious Tone",
            "POST",
            "api/mirror/reflect",
            200,
            data=test_data
        )
        
        if success and response:
            # Check tone tags for anxious content
            tone_tags = response.get('tone_tags', [])
            if 'restless' in tone_tags or any('anx' in tag.lower() for tag in tone_tags):
                print("✅ Mirror correctly identified anxious tone")
            else:
                print(f"⚠️ Mirror may not have identified anxious tone. Tags: {tone_tags}")
        
        return success, response

    def test_mirror_reflection_archetype(self):
        """Test Mirror reflection for B8 (should return archetype)"""
        if not self.session_ids:
            print("❌ No session ID available for Mirror test")
            return False, {}
            
        test_data = {
            "session_id": self.session_ids[0],
            "bloom_id": "B8",
            "journal_text": "I feel ready to listen deeply to what wants to emerge. I'm seeking wisdom and understanding about my path forward.",
            "user_history": []
        }
        
        print("⏳ Testing Mirror reflection for archetype assignment...")
        success, response = self.run_test(
            "Mirror Reflection - Archetype Assignment (B8)",
            "POST",
            "api/mirror/reflect",
            200,
            data=test_data
        )
        
        if success and response:
            # Check if archetype is assigned for B8
            archetype_id = response.get('archetype_id')
            if archetype_id:
                print(f"✅ Archetype assigned: {archetype_id}")
            else:
                print("❌ No archetype assigned for B8 bloom")
                return False, response
        
        return success, response

def main():
    print("🚀 Starting Hall of Mirrors Backend API Tests")
    print("=" * 60)
    
    # Setup
    tester = HallOfMirrorsAPITester()

    # Run basic tests first
    print("\n📋 Testing Basic API Endpoints...")
    tester.test_root_endpoint()
    tester.test_create_status_check()
    tester.test_get_status_checks()

    # Test Hall of Mirrors specific features
    print("\n🪞 Testing Hall of Mirrors Features...")
    
    # Test progressive bloom unlocking
    print("\n🌸 Testing Progressive Bloom Unlocking...")
    tester.test_create_first_session()
    tester.test_create_second_session()
    tester.test_create_third_session()
    
    # Test session retrieval
    if tester.session_ids:
        print("\n📖 Testing Session Retrieval...")
        for session_id in tester.session_ids:
            tester.test_get_session(session_id)
    
    # Test Mirror reflections with different tones
    print("\n🪞 Testing Mirror LLM Reflections...")
    tester.test_mirror_reflection_hopeful()
    time.sleep(2)  # Brief pause between LLM calls
    tester.test_mirror_reflection_anxious()
    time.sleep(2)  # Brief pause between LLM calls
    tester.test_mirror_reflection_archetype()

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All Hall of Mirrors backend API tests passed!")
        return 0
    else:
        print("⚠️  Some backend API tests failed")
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"❌ {failed_tests} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())