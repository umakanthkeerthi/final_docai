import requests
import json

url = "http://localhost:8002/api/appointments/book"
data = {
    "user_id": "test",
    "doctor_id": "doc_pc_2",
    "doctor_uid": "r99Cbl8NvlPeKpt7Q9LiCR1RX142",
    "doctor_name": "Dr. Test",
    "doctor_specialty": "Test",
    "doctor_location": {},
    "appointment_date": "2026-01-04",
    "appointment_time": "10:00",
    "consultation_fee": 500,
    "is_urgent": True
}

print("Sending test appointment request...")
response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
