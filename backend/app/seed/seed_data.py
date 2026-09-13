import datetime
import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.schemas import (
    User, GovernmentProfile, University, Faculty, StudentTeam, IndustryOrganization, 
    Challenge, ChallengeDuplicate, IndustryOpportunity, Project, ProjectMilestone, 
    ImpactMetric, CitizenFeedback, Notification, AuditLog
)
from app.auth.jwt import get_password_hash
from app.ai.classifier import classify_challenge
from app.ai.priority import calculate_priority_score
from app.ai.embedding import get_embedding, calculate_cosine_similarity

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "citizen@solvesphere.gov.in").first():
        print("[Seed] Database already seeded.")
        db.close()
        return

    print("[Seed] Seeding database with realistic SIH demonstration data...")

    # 1. Create Demo Users
    users_data = [
        {"email": "citizen@solvesphere.gov.in", "name": "Ramesh Kumar (Citizen)", "role": "CITIZEN", "org": "Public Citizen"},
        {"email": "gov@solvesphere.gov.in", "name": "Anita Verma (Municipal Officer)", "role": "GOVERNMENT", "org": "Urban Development Dept"},
        {"email": "university@solvesphere.gov.in", "name": "Dr. Rajesh Sharma (Faculty Advisor)", "role": "UNIVERSITY", "org": "ABC Institute of Technology"},
        {"email": "industry@solvesphere.gov.in", "name": "Vikram Mehta (CSR Lead)", "role": "INDUSTRY", "org": "SmartCity Technologies"}
    ]

    user_objs = {}
    for u in users_data:
        usr = User(
            email=u["email"],
            password_hash=get_password_hash("demo1234"),
            full_name=u["name"],
            role=u["role"],
            organization_name=u["org"]
        )
        db.add(usr)
        db.flush()
        user_objs[u["role"]] = usr

    # 2. Government Profile
    gov_prof = GovernmentProfile(
        user_id=user_objs["GOVERNMENT"].id,
        department="Urban Development & Civil Works",
        designation="Senior Municipal Engineer",
        jurisdiction="Greater City Region"
    )
    db.add(gov_prof)

    # 3. Universities & Faculty & Teams
    uni1 = University(
        name="ABC Institute of Technology",
        state="Maharashtra",
        city="Pune",
        departments=["Civil Engineering", "GIS & Sensing", "Computer Science", "Environmental Science"],
        domains=["Environment", "Transportation", "Water & Sanitation", "Smart City"],
        research_areas=["Urban Drainage Modeling", "IoT Flood Sensors", "AI Traffic Management"],
        facilities=["GIS Remote Sensing Lab", "IoT Hardware Workshop", "Hydraulics Testing Rig"]
    )
    uni2 = University(
        name="XYZ National Institute of Technology",
        state="Karnataka",
        city="Bengaluru",
        departments=["Electrical Engineering", "AI & Robotics", "Public Health"],
        domains=["Healthcare", "Public Safety", "Energy"],
        research_areas=["Smart Grid Security", "Telemedicine Kiosks", "Autonomous Drones"],
        facilities=["AI Cleanroom Lab", "Biomedical Testing Lab"]
    )
    db.add(uni1)
    db.add(uni2)
    db.flush()

    fac1 = Faculty(
        university_id=uni1.id,
        name="Dr. Rajesh Sharma",
        email="rsharma@abcit.edu.in",
        department="Civil Engineering",
        expertise=["Hydrology", "Urban Drainage", "GIS Mapping"],
        research_areas=["Stormwater Drain Optimization", "Flood Early Warning"]
    )
    fac2 = Faculty(
        university_id=uni1.id,
        name="Prof. Sunita Patil",
        email="spatil@abcit.edu.in",
        department="Computer Science",
        expertise=["IoT Networks", "Embedded Systems", "Edge AI"],
        research_areas=["Smart Sensor Nodes", "Low-Power Mesh Networks"]
    )
    db.add(fac1)
    db.add(fac2)

    team1 = StudentTeam(
        university_id=uni1.id,
        team_name="HydroSensors Team",
        department="Civil & CS Dual Program",
        skills=["GIS Mapping", "Arduino/Raspberry Pi", "Python", "Data Analytics"],
        leader_name="Aarav Deshmukh",
        member_count=5
    )
    team2 = StudentTeam(
        university_id=uni2.id,
        team_name="CleanSurge Innovators",
        department="AI & Robotics",
        skills=["Machine Learning", "Embedded C++", "Circuit Design"],
        leader_name="Priya Nair",
        member_count=4
    )
    db.add(team1)
    db.add(team2)

    # 4. Industry Orgs & Opportunities
    ind1 = IndustryOrganization(
        user_id=user_objs["INDUSTRY"].id,
        org_name="SmartCity Technologies",
        industry_domain="Smart City & IoT",
        expertise=["IoT Sensors", "Cloud Dashboards", "Telemetry", "Edge Gateway"],
        support_types=["HARDWARE", "MENTORSHIP", "PILOT", "TECHNOLOGY"],
        funding_available_inr=500000.0
    )
    ind2 = IndustryOrganization(
        org_name="EcoUrban Solutions Foundation",
        industry_domain="Environment & Water",
        expertise=["Drainage Engineering", "Recycled Materials", "CSR Grants"],
        support_types=["FUNDING", "PROTOTYPING", "DEPLOYMENT"],
        funding_available_inr=800000.0
    )
    db.add(ind1)
    db.add(ind2)
    db.flush()

    opp1 = IndustryOpportunity(
        industry_id=ind1.id,
        title="IoT Sensor Hardware Grant & Cloud Platform Access",
        description="Providing 20 ultrasonic water level sensors, 5 Cellular Gateways, and free cloud telemetry API access for urban drainage projects.",
        support_type="HARDWARE",
        budget_inr=300000.0,
        domains=["Environment", "Smart City", "Water & Sanitation"],
        location="Maharashtra",
        status="ACTIVE"
    )
    opp2 = IndustryOpportunity(
        industry_id=ind2.id,
        title="CSR Innovation Grant for Civic Drainage Solutions",
        description="Direct funding up to Rs. 5 Lakhs for university prototypes demonstrating 50%+ reduction in monsoon road flooding.",
        support_type="FUNDING",
        budget_inr=500000.0,
        domains=["Environment", "Urban Drainage"],
        location="Pan-India",
        status="ACTIVE"
    )
    db.add(opp1)
    db.add(opp2)

    # 5. Challenges Seed (Highlighting SS-1042)
    seed_challenges = [
        {
            "id": "SS-1042",
            "title": "Urban Waterlogging Near ABC School",
            "description": "During heavy rainfall, severe water accumulation occurs near ABC School entrance. Water remains logged for 6-8 hours, preventing over 2,400 students and local residents from accessing the school safely.",
            "category": "Environment",
            "sub_category": "Urban Drainage",
            "location_name": "ABC School Road, Sector 4, Pune",
            "lat": 18.5204,
            "lng": 73.8567,
            "severity": "HIGH",
            "affected": 2450,
            "frequency": "Monsoon",
            "evidence": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7",
            "status": "VERIFIED"
        },
        {
            "id": "SS-9821",
            "title": "Road Water Accumulation During Rainfall Near Sector 4",
            "description": "Children cannot use the main approach road near ABC school during heavy rainfall due to water accumulation and clogged storm drains.",
            "category": "Environment",
            "sub_category": "Urban Drainage",
            "location_name": "Sector 4 Junction, Pune",
            "lat": 18.5215,
            "lng": 73.8580,
            "severity": "HIGH",
            "affected": 1800,
            "frequency": "Monsoon",
            "evidence": None,
            "status": "AI_ANALYZED"
        },
        {
            "id": "SS-2015",
            "title": "Unlit Dark Alleyway Near Metro Station Gate 2",
            "description": "Streetlights have been non-functional for 3 months along the 400m pedestrian walkway, creating severe safety risks for women commuters after 8 PM.",
            "category": "Public Safety",
            "sub_category": "Street Lighting",
            "location_name": "MG Road Metro Gate 2, Pune",
            "lat": 18.5300,
            "lng": 73.8400,
            "severity": "CRITICAL",
            "affected": 5200,
            "frequency": "Daily",
            "evidence": None,
            "status": "VERIFIED"
        },
        {
            "id": "SS-3110",
            "title": "Drinking Water Contamination in Community Pipeline",
            "description": "Turbid water with high dissolved solids reported in residential taps, resulting in gastrointestinal infections among 400 families.",
            "category": "Water & Sanitation",
            "sub_category": "Drinking Water Quality",
            "location_name": "Viman Nagar Block C, Pune",
            "lat": 18.5600,
            "lng": 73.9100,
            "severity": "CRITICAL",
            "affected": 1600,
            "frequency": "Daily",
            "evidence": None,
            "status": "VERIFIED"
        },
        {
            "id": "SS-4055",
            "title": "Hospital Emergency Ambulance Traffic Bottleneck",
            "description": "Unsynchronized traffic signals at Civil Hospital junction delay emergency medical vehicles by an average of 22 minutes during peak morning hours.",
            "category": "Healthcare",
            "sub_category": "Emergency Response",
            "location_name": "Civil Hospital Chowk, Pune",
            "lat": 18.5100,
            "lng": 73.8600,
            "severity": "HIGH",
            "affected": 8500,
            "frequency": "Daily",
            "evidence": None,
            "status": "VERIFIED"
        }
    ]

    # Add 15 more generic realistic challenges to reach 20 total
    cats = ["Environment", "Healthcare", "Education", "Transportation", "Public Safety", "Water & Sanitation", "Waste Management", "Agriculture", "Smart City", "Accessibility", "Energy"]
    for i in range(6, 21):
        cat = cats[i % len(cats)]
        ch_id = f"SS-{1000 + i*47}"
        seed_challenges.append({
            "id": ch_id,
            "title": f"Civic Challenge in {cat} Sector #{i}",
            "description": f"Detailed citizen complaint regarding {cat.lower()} infrastructure needing immediate technical analysis, sensor monitoring, and community solution deployment.",
            "category": cat,
            "sub_category": "Infrastructure Upgrade",
            "location_name": f"Ward {i}, Central Zone, Pune",
            "lat": 18.5000 + (i * 0.005),
            "lng": 73.8500 + (i * 0.005),
            "severity": "MEDIUM" if i % 2 == 0 else "HIGH",
            "affected": 300 + (i * 120),
            "frequency": "Daily",
            "evidence": None,
            "status": "VERIFIED" if i % 2 == 0 else "AI_ANALYZED"
        })

    ch_objs = []
    for sc in seed_challenges:
        domain, sub_domain, conf = classify_challenge(sc["title"], sc["description"], sc["category"])
        priority_res = calculate_priority_score(sc["affected"], sc["severity"], sc["frequency"], sc["evidence"], sc["description"])
        emb = get_embedding(sc["title"] + " " + sc["description"])

        ch = Challenge(
            id=sc["id"],
            title=sc["title"],
            description=sc["description"],
            category=domain,
            sub_category=sub_domain,
            location_name=sc["location_name"],
            latitude=sc["lat"],
            longitude=sc["lng"],
            severity=sc["severity"],
            people_affected=sc["affected"],
            frequency=sc["frequency"],
            evidence_url=sc["evidence"],
            priority_score=priority_res["priority_score"],
            impact_score=priority_res["impact_score"],
            urgency_score=priority_res["urgency_score"],
            evidence_score=priority_res["evidence_score"],
            priority_level=priority_res["priority_level"],
            ai_confidence=conf,
            embedding_json=emb,
            status=sc["status"],
            citizen_id=user_objs["CITIZEN"].id,
            upvotes_count=random.randint(15, 120)
        )
        db.add(ch)
        ch_objs.append(ch)

    db.flush()

    # 6. Flag Duplicate for SS-1042 vs SS-9821
    ch_main = db.query(Challenge).filter(Challenge.id == "SS-1042").first()
    ch_dup = db.query(Challenge).filter(Challenge.id == "SS-9821").first()
    if ch_main and ch_dup:
        sim = calculate_cosine_similarity(ch_main.embedding_json, ch_dup.embedding_json)
        dup_rec = ChallengeDuplicate(
            challenge_id="SS-1042",
            duplicate_challenge_id="SS-9821",
            similarity_score=max(91.0, sim),
            status="POTENTIAL_DUPLICATE"
        )
        db.add(dup_rec)

    # 7. Create Primary Demo Project for SS-1042
    proj_id = "SS-P-1042"
    project = Project(
        id=proj_id,
        challenge_id="SS-1042",
        title="Smart Flood Monitoring & Automated Storm Drain Gate System",
        description="Deploying IoT ultrasonic water level sensors, real-world GIS drainage modeling, and automated sluice gates near ABC School to prevent waterlogging.",
        status="PROTOTYPE",
        university_id=uni1.id,
        faculty_id=fac1.id,
        student_team_id=team1.id,
        industry_id=ind1.id,
        gov_officer_id=user_objs["GOVERNMENT"].id
    )
    db.add(project)

    # Milestones for SS-P-1042
    ms_data = [
        {"title": "Government Verification & Requirement Scoping", "stage": "PROBLEM_VERIFIED", "status": "COMPLETED", "due": "2026-08-10"},
        {"title": "Multi-Stakeholder Team Formation (University + Industry)", "stage": "TEAM_FORMED", "status": "COMPLETED", "due": "2026-08-20"},
        {"title": "IoT Flood Sensor Hardware & GIS Drain Prototype", "stage": "PROTOTYPE", "status": "COMPLETED", "due": "2026-09-01"},
        {"title": "Field Pilot Testing at ABC School Junction", "stage": "PILOT", "status": "IN_PROGRESS", "due": "2026-09-25"},
        {"title": "Full Municipal Drainage Network Deployment", "stage": "DEPLOYMENT", "status": "PENDING", "due": "2026-10-15"}
    ]

    for m in ms_data:
        pm = ProjectMilestone(
            project_id=proj_id,
            title=m["title"],
            description=f"Detailed execution for stage: {m['stage']}",
            stage=m["stage"],
            status=m["status"],
            due_date=m["due"],
            completed_at=datetime.datetime.utcnow() if m["status"] == "COMPLETED" else None,
            proof_url="https://images.unsplash.com/photo-1581092160607-ee22621dd758" if m["status"] == "COMPLETED" else None
        )
        db.add(pm)

    # Impact Metric for SS-P-1042
    impact = ImpactMetric(
        project_id=proj_id,
        citizens_affected=2450,
        incidents_before_monthly=500,
        incidents_after_monthly=120,
        response_time_before_hours=72.0,
        response_time_after_hours=12.0,
        cost_before_inr=500000.0,
        cost_after_inr=120000.0,
        user_satisfaction_percent=94.0,
        deployment_status="PILOT_VALIDATION",
        is_demo_data=True
    )
    db.add(impact)

    # Citizen Feedback for SS-1042
    fb = CitizenFeedback(
        challenge_id="SS-1042",
        project_id=proj_id,
        citizen_id=user_objs["CITIZEN"].id,
        rating=5,
        comment="The IoT water sensors installed near ABC School have alerted municipal workers early during the last heavy rain! The road cleared 4x faster.",
        problem_status="RESOLVED"
    )
    db.add(fb)

    # Notifications
    n1 = Notification(
        user_id=user_objs["CITIZEN"].id,
        title="Challenge Verified!",
        message="Your reported challenge SS-1042 (Urban Waterlogging Near ABC School) was verified by Government Officers.",
        link="/citizen/challenges/SS-1042"
    )
    n2 = Notification(
        user_id=user_objs["UNIVERSITY"].id,
        title="New 94% Match Challenge Found",
        message="ABC University has been recommended for challenge SS-1042 based on Civil Engineering & GIS expertise.",
        link="/university/matches"
    )
    db.add(n1)
    db.add(n2)

    # Audit Logs
    db.add(AuditLog(action="CHALLENGE_CREATED", actor_id=user_objs["CITIZEN"].id, actor_role="CITIZEN", target_type="CHALLENGE", target_id="SS-1042", details={"title": "Urban Waterlogging Near ABC School"}))
    db.add(AuditLog(action="CHALLENGE_VERIFIED", actor_id=user_objs["GOVERNMENT"].id, actor_role="GOVERNMENT", target_type="CHALLENGE", target_id="SS-1042", details={"status": "VERIFIED"}))
    db.add(AuditLog(action="PROJECT_CREATED", actor_id=user_objs["UNIVERSITY"].id, actor_role="UNIVERSITY", target_type="PROJECT", target_id=proj_id, details={"university": "ABC Institute of Technology"}))
    db.add(AuditLog(action="INDUSTRY_JOINED", actor_id=user_objs["INDUSTRY"].id, actor_role="INDUSTRY", target_type="PROJECT", target_id=proj_id, details={"company": "SmartCity Technologies"}))

    db.commit()
    db.close()
    print("[Seed] Successfully seeded SolveSphere database with complete demonstration records!")

if __name__ == "__main__":
    seed_database()
