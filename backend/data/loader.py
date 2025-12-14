
import json
import random
from typing import List, Dict

# Mock Dataset Generator for NSQF / Vocational Pathways
# In real life, this would query NCVET API or SQL Database

INDUSTRY_SECTORS = [
    "IT-ITeS", "Automotive", "Healthcare", "Construction", 
    "Agriculture", "Retail", "Electronics", "Green Jobs"
]

SKILLS_BY_SECTOR = {
    "IT-ITeS": ["Python", "Java", "Data Entry", "Cybersecurity", "Cloud Computing", "Web Design"],
    "Automotive": ["Engine Repair", "Vehicle Diagnostics", "Welding", "Painting", "EV Maintenance"],
    "Healthcare": ["General Duty Assistant", "Phlebotomy", "Emergency Medical Technician", "Patient Care"],
    "Electronics": ["PCB Assembly", "Mobile Repair", "Solar Panel Installation", "IoT Devices"],
    "Green Jobs": ["Solar Installation", "Waste Management", "Water Treatment", "EV Charging Station Mgr"]
}

def generate_mock_nsqf_courses(count: int = 50) -> List[Dict]:
    """
    Generates a list of mock vocational courses aligned to NSQF levels.
    """
    courses = []
    
    for i in range(count):
        sector = random.choice(INDUSTRY_SECTORS)
        
        # NSQF Level 1-10 (1=Entry, 10=PhD/Research)
        # Vocational commonly 3-6
        level = random.randint(3, 7)
        
        skills_pool = SKILLS_BY_SECTOR.get(sector, ["Communication"])
        main_skill = random.choice(skills_pool)
        
        title = f"{main_skill} Specialist - NSQF Level {level}"
        description = f"A comprehensive {level * 50}-hour course covering {main_skill} and industry safety standards. Certified by Sector Skill Council."
        
        course = {
            "id": f"C-{1000+i}",
            "title": title,
            "sector": sector,
            "nsqf_level": level,
            "description": description,
            "skills": f"{main_skill}, {sector}, Safety, Teamwork",
            "duration_hours": level * 50,
            "provider": f"National Skill Training Institute - {random.choice(['North', 'South', 'East', 'West'])}"
        }
        courses.append(course)
        
    return courses

def save_mock_data(courses: List[Dict], filepath: str):
    with open(filepath, 'w') as f:
        json.dump(courses, f, indent=2)

if __name__ == "__main__":
    # Test generation
    data = generate_mock_nsqf_courses(5)
    print(json.dumps(data, indent=2))
