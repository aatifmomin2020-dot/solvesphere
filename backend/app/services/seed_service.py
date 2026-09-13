import random
import uuid
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models import (
    User, Role, UserRole, Organization, University, Department, Faculty, StudentTeam,
    TeamMember, IndustryOrganization, Challenge, ChallengeMedia, ChallengeStatusHistory,
    ChallengeEmbedding, AIAnalysis, Proposal, Project, ProjectMember, Partnership,
    Milestone, ImpactMetric, RecommendationRecord, ChallengeFeedback
)
from app.core.security import get_password_hash
from app.core.logging import logger

DEMO_USERS = [
    {"email": "citizen@solvesphere.gov.in", "role": "CITIZEN", "full_name": "Aarav Sharma (Citizen)"},
    {"email": "gov@solvesphere.gov.in", "role": "GOVERNMENT", "full_name": "Priya Patel (Gov Reviewer)"},
    {"email": "university@solvesphere.gov.in", "role": "UNIVERSITY", "full_name": "Dr. Rajesh K. (Univ Admin)"},
    {"email": "industry@solvesphere.gov.in", "role": "INDUSTRY", "full_name": "Ananya Roy (Industry Partner)"},
    {"email": "faculty@solvesphere.gov.in", "role": "FACULTY", "full_name": "Prof. Vikram Malhotra (Faculty Mentor)"},
    {"email": "student@solvesphere.gov.in", "role": "STUDENT", "full_name": "Rohan Gupta (Student Lead)"},
]

DOMAINS = [
    "Education", "Healthcare", "Agriculture", "Water", "Sanitation",
    "Environment", "Energy", "Urban Infrastructure", "Accessibility",
    "Public Administration", "Rural Livelihoods"
]

DISTRICTS = ["Pune", "Mumbai Urban", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Kolhapur"]

CHALLENGE_TITLES = [
    "Urban Waterlogging Near ABC School",
    "Pothole Accumulation on Main Highway St",
    "Rural Drinking Water Contamination in Sector 4",
    "Public School Solar Panel Grid Deficit",
    "Disability Ramp Absence at District Library",
    "Agricultural Crop Pest Outbreak in Ward 12",
    "Primary Health Center Medicine Supply Delay",
    "Streetlight Failure along Market Corridor",
    "Waste Segregation Non-compliance in Housing Societies",
    "Bus Transit Frequency Shortage for College Students"
]


async def seed_database(db: AsyncSession):
    existing = await db.execute(select(func.count(User.id)))
    user_count = existing.scalar()
    if user_count and user_count >= 5:
        logger.info("Database already seeded. Skipping.")
        return

    logger.info("Starting database seeding...")

    # 1. Create Roles
    roles = ["CITIZEN", "GOVERNMENT", "UNIVERSITY", "INDUSTRY", "GOVERNMENT_REVIEWER", "FACULTY", "STUDENT", "PLATFORM_ADMIN"]
    for r in roles:
        db.add(Role(id=str(uuid.uuid4()), name=r, description=f"Role {r}"))

    # 2. Create Demo Users
    hashed_pwd = get_password_hash("demo1234")
    user_map = {}
    for du in DEMO_USERS:
        u = User(
            id=str(uuid.uuid4()),
            email=du["email"],
            hashed_password=hashed_pwd,
            full_name=du["full_name"],
            primary_role=du["role"],
            is_demo=True
        )
        db.add(u)
        user_map[du["role"]] = u

    await db.flush()

    for role_name, u_obj in user_map.items():
        db.add(UserRole(id=str(uuid.uuid4()), user_id=u_obj.id, role_name=role_name))

    # 3. Create Organizations & University & Industry
    gov_org = Organization(id=str(uuid.uuid4()), name="Department of Urban Infrastructure", org_type="GOVERNMENT", district="Pune", state="Maharashtra")
    univ_org = Organization(id=str(uuid.uuid4()), name="ABC Institute of Technology", org_type="UNIVERSITY", district="Pune", state="Maharashtra")
    ind_org = Organization(id=str(uuid.uuid4()), name="SmartCity Technologies Ltd", org_type="INDUSTRY", district="Pune", state="Maharashtra")
    
    db.add_all([gov_org, univ_org, ind_org])
    await db.flush()

    univ = University(
        id=str(uuid.uuid4()),
        organization_id=univ_org.id,
        name="ABC Institute of Technology [DEMO INSTITUTION]",
        code="ABCT-PN",
        nirf_rank=14,
        location_district="Pune",
        facilities_json=["Hydrology Lab", "IoT Prototyping Lab", "GIS Mapping Suite", "Environmental Testing"],
        capacity_projects=15,
        is_demo=True
    )
    db.add(univ)
    await db.flush()

    dept = Department(
        id=str(uuid.uuid4()),
        university_id=univ.id,
        name="Department of Civil & Environmental Engineering",
        domain_focus="Environment",
        head_faculty_name="Dr. V. Malhotra"
    )
    db.add(dept)
    await db.flush()

    fac_user = user_map["FACULTY"]
    fac = Faculty(
        id=str(uuid.uuid4()),
        user_id=fac_user.id,
        department_id=dept.id,
        designation="Professor & HOD",
        research_areas=["Hydrology", "Urban Drainage", "GIS Analytics", "IoT Sensors"]
    )
    db.add(fac)
    await db.flush()

    stud_user = user_map["STUDENT"]
    team = StudentTeam(
        id=str(uuid.uuid4()),
        university_id=univ.id,
        department_id=dept.id,
        team_name="Team HydroSolve",
        faculty_mentor_id=fac.id
    )
    db.add(team)
    await db.flush()
    db.add(TeamMember(id=str(uuid.uuid4()), team_id=team.id, user_id=stud_user.id, role_in_team="LEAD"))

    ind = IndustryOrganization(
        id=str(uuid.uuid4()),
        organization_id=ind_org.id,
        company_name="SmartCity Technologies [DEMO PARTNER]",
        industry_sector="IoT & Civil Engineering Systems",
        offering_types=["MENTORSHIP", "FUNDING", "PROTOTYPING", "PILOT"],
        is_demo=True
    )
    db.add(ind)
    await db.flush()

    # 4. Create Flagship Challenge: SS-1042
    flagship_ch = Challenge(
        id=str(uuid.uuid4()),
        public_code="SS-1042",
        title="Urban Waterlogging Near ABC School",
        description="During heavy rainfall, severe water accumulation occurs near ABC School. Students and residents face difficulty accessing the road safely due to clogged drainage channels.",
        domain="Environment",
        sub_domain="Urban Drainage",
        ai_priority_score=0.92,
        official_priority="HIGH",
        priority_reason="High risk to school children access and severe traffic disruption during monsoons.",
        status="DEPLOYED",
        district="Pune",
        locality="Near ABC School, Sector 4",
        approx_latitude=18.5204,
        approx_longitude=73.8567,
        precise_latitude=18.520432,
        precise_longitude=73.856711,
        affected_population=2450,
        severity_level="SEVERE",
        frequency="RECURRING",
        citizen_id=user_map["CITIZEN"].id,
        assigned_department="Department of Urban Infrastructure",
        assigned_officer_id=user_map["GOVERNMENT"].id,
        verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=30),
        verified_by_id=user_map["GOVERNMENT"].id,
        is_demo=True
    )
    db.add(flagship_ch)
    await db.flush()

    ai_an = AIAnalysis(
        id=str(uuid.uuid4()),
        challenge_id=flagship_ch.id,
        domain_recommended="Environment",
        sub_domain_recommended="Urban Drainage",
        summary_generated="Severe urban flooding and drainage blockage near educational campus during monsoons.",
        keywords_extracted=["waterlogging", "urban drainage", "school access", "monsoon overflow", "civil engineering"],
        confidence_score=0.95,
        priority_recommended="HIGH",
        priority_score_breakdown={"impact": 0.90, "urgency": 0.92, "vulnerability": 0.95, "safety": 0.88},
        latency_ms=95
    )
    db.add(ai_an)

    db.add(RecommendationRecord(
        id=str(uuid.uuid4()),
        challenge_id=flagship_ch.id,
        university_id=univ.id,
        overall_match_score=0.94,
        factor_breakdown_json={
            "domain_match": 1.0,
            "department_expertise": 0.95,
            "faculty_expertise": 0.92,
            "facilities_available": 0.90,
            "location_proximity": 1.0
        }
    ))

    prop = Proposal(
        id=str(uuid.uuid4()),
        challenge_id=flagship_ch.id,
        team_id=team.id,
        university_id=univ.id,
        faculty_mentor_id=fac.id,
        title="Smart Modular IoT Drainage & Permeable Pavement Network",
        problem_interpretation="Runoff water overflow caused by insufficient culvert gradient and sediment accumulation near school entrance.",
        proposed_solution="Deployment of modular permeable drainage chambers equipped with IoT water level sensors for real-time blockage alerts.",
        technical_architecture="Ultrasonic level sensors + LoRaWAN telemetry + Gravity-fed filtration trench.",
        estimated_timeline_weeks=10,
        budget_estimate_inr=250000.0,
        status="APPROVED"
    )
    db.add(prop)
    await db.flush()

    proj = Project(
        id=str(uuid.uuid4()),
        proposal_id=prop.id,
        challenge_id=flagship_ch.id,
        university_id=univ.id,
        team_id=team.id,
        title="Project HydroSolve: School Zone Flood Mitigation",
        stage="DEPLOYED",
        progress_percentage=100,
        deployed_at=datetime.datetime.utcnow() - datetime.timedelta(days=5),
        is_demo=True
    )
    db.add(proj)
    await db.flush()

    db.add_all([
        ProjectMember(id=str(uuid.uuid4()), project_id=proj.id, user_id=fac_user.id, role="FACULTY_MENTOR"),
        ProjectMember(id=str(uuid.uuid4()), project_id=proj.id, user_id=stud_user.id, role="STUDENT_LEAD"),
        ProjectMember(id=str(uuid.uuid4()), project_id=proj.id, user_id=user_map["GOVERNMENT"].id, role="GOV_OFFICER"),
        ProjectMember(id=str(uuid.uuid4()), project_id=proj.id, user_id=user_map["INDUSTRY"].id, role="INDUSTRY_MENTOR"),
    ])

    part = Partnership(
        id=str(uuid.uuid4()),
        project_id=proj.id,
        industry_id=ind.id,
        contribution_types=["MENTORSHIP", "FUNDING", "PROTOTYPING", "PILOT"],
        funding_amount_inr=150000.0,
        description="Provided IoT sensor hardware, LoRa gateway, and technical field mentorship.",
        status="ACCEPTED",
        is_demo=True
    )
    db.add(part)

    ms_list = [
        {"title": "Requirement & Hydrological Analysis", "seq": 1, "status": "APPROVED", "pct": 100},
        {"title": "IoT Sensor & Modular Drain Prototype", "seq": 2, "status": "APPROVED", "pct": 100},
        {"title": "Field Pilot Testing at ABC School Road", "seq": 3, "status": "APPROVED", "pct": 100},
        {"title": "Government Audit & Validation", "seq": 4, "status": "APPROVED", "pct": 100},
        {"title": "Full Scale Deployment & Handover", "seq": 5, "status": "COMPLETED", "pct": 100},
    ]
    for m in ms_list:
        db.add(Milestone(
            id=str(uuid.uuid4()),
            project_id=proj.id,
            title=m["title"],
            description=f"Stage milestone: {m['title']}",
            sequence_order=m["seq"],
            due_date=datetime.datetime.utcnow() - datetime.timedelta(days=(5 - m["seq"]) * 5),
            completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=(5 - m["seq"]) * 5),
            status=m["status"],
            completion_percentage=m["pct"]
        ))

    db.add(ImpactMetric(
        id=str(uuid.uuid4()),
        project_id=proj.id,
        people_reached=2450,
        incident_reduction_percentage=78.0,
        time_saved_hours_per_month=160.0,
        cost_saved_inr=450000.0,
        environmental_score="ZERO_SCHOOL_CLOSURE_DAYS [DEMO DATA]",
        is_demo=True
    ))

    db.add(ChallengeFeedback(
        id=str(uuid.uuid4()),
        challenge_id=flagship_ch.id,
        citizen_id=user_map["CITIZEN"].id,
        rating=5,
        is_resolved="YES",
        comment="Waterlogging near school entrance has completely stopped! Highly grateful to the university team and municipal team."
    ))

    # Seed 99 Additional Challenges
    statuses = ["SUBMITTED", "AI_ANALYZED", "AWAITING_VERIFICATION", "VERIFIED", "ROUTED", "PROPOSAL_SUBMITTED", "ACTIVE", "PROTOTYPE", "PILOT", "DEPLOYED", "CLOSED"]
    severities = ["LOW", "MODERATE", "HIGH", "SEVERE"]
    priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    for i in range(1, 100):
        code_num = 1042 + i
        domain = random.choice(DOMAINS)
        dist = random.choice(DISTRICTS)
        st = random.choice(statuses)
        sev = random.choice(severities)
        prio = random.choice(priorities)
        
        c_obj = Challenge(
            id=str(uuid.uuid4()),
            public_code=f"SS-{code_num}",
            title=f"{random.choice(CHALLENGE_TITLES)} #{i}",
            description=f"Detailed report regarding public issue in {dist}. Affected citizens request rapid technological and government intervention. [DEMO DATA]",
            domain=domain,
            sub_domain="General Infrastructure",
            ai_priority_score=round(random.uniform(0.3, 0.98), 2),
            official_priority=prio,
            priority_reason="Automated priority calculation based on population impact and vulnerability.",
            status=st,
            district=dist,
            locality=f"Sector {random.randint(1, 20)}, {dist}",
            approx_latitude=round(18.5 + random.uniform(-0.5, 0.5), 4),
            approx_longitude=round(73.8 + random.uniform(-0.5, 0.5), 4),
            affected_population=random.randint(50, 5000),
            severity_level=sev,
            frequency=random.choice(["OCCASIONAL", "RECURRING", "CONTINUOUS"]),
            citizen_id=user_map["CITIZEN"].id if i % 2 == 0 else None,
            is_anonymous=(i % 3 == 0),
            assigned_department=f"Department of {domain}",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 90)),
            is_demo=True
        )
        db.add(c_obj)

    await db.commit()
    logger.info("Database seeding completed successfully!")
