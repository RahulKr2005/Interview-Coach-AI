import io
import re
from typing import Dict, List, Any, Tuple
from pypdf import PdfReader

# Curated tech keywords for heuristic extraction across supported roles
KNOWN_SKILLS = [
    # Frontend
    "React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", "Next.js", "Vite",
    "Redux", "Zustand", "Vue.js", "Angular", "SASS", "Webpack", "Responsive Design",
    # Backend
    "Python", "FastAPI", "Django", "Flask", "Node.js", "Express", "RESTful APIs",
    "GraphQL", "Microservices", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis",
    # Java
    "Java", "Spring Boot", "Hibernate", "JPA", "Maven", "Gradle", "JUnit", "JVM",
    # Data Analyst
    "SQL", "Pandas", "NumPy", "Tableau", "Power BI", "Excel", "Data Cleaning",
    "A/B Testing", "EDA", "Matplotlib", "Seaborn", "Statistics", "ETL",
    # DevOps & Tools
    "Git", "GitHub", "Docker", "Kubernetes", "CI/CD", "Linux", "AWS", "Azure",
    "Terraform", "Prometheus", "Grafana", "Nginx", "Bash"
]

MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024  # 5MB

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, bool, str]:
    """
    Extracts text from PDF bytes using pure-Python pypdf.
    Returns (extracted_text, is_scanned_or_empty, status_message).
    """
    if len(file_bytes) > MAX_PDF_SIZE_BYTES:
        return "", False, f"File exceeds maximum allowed size of 5MB ({len(file_bytes) / 1024 / 1024:.1f}MB uploaded)."
    
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        num_pages = len(reader.pages)
        if num_pages == 0:
            return "", True, "The PDF file contains 0 pages."

        extracted_text_parts = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            extracted_text_parts.append(page_text.strip())

        full_text = "\n\n".join(extracted_text_parts).strip()

        # Scanned PDF check: if very few characters extracted relative to pages
        if len(full_text) < 30:
            return (
                full_text,
                True,
                "This PDF appears to be a scanned image or contains no selectable text. "
                "Local OCR is not included to keep the app lightweight and offline-friendly. "
                "Please use the 'Paste Resume Text' option below to input your resume details directly."
            )

        return full_text, False, f"Successfully extracted text from {num_pages} page(s)."

    except Exception as e:
        return "", False, f"Failed to parse PDF document: {str(e)}"

def extract_skills_heuristic(text: str) -> List[str]:
    """
    Identifies technical skills using case-insensitive keyword heuristics.
    Never hallucinates skills not present in the text.
    """
    found_skills = []
    text_lower = text.lower()
    
    for skill in KNOWN_SKILLS:
        # Check word boundaries where appropriate to avoid false substrings (e.g. 'C' in 'CSS')
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
            
    return sorted(list(set(found_skills)))

def extract_projects_heuristic(text: str) -> List[str]:
    """
    Identifies project entries based on common resume header patterns.
    """
    projects = []
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    in_project_section = False
    current_project = []

    stop_keywords = ["education", "skills", "experience", "certifications", "achievements", "work history"]

    for line in lines:
        lower = line.lower()
        # Detect start of projects section
        if any(h in lower for h in ["projects", "personal projects", "academic projects", "key projects"]):
            in_project_section = True
            continue
            
        # Detect end of projects section
        if in_project_section and any(stop in lower for stop in stop_keywords) and len(line) < 30:
            break
            
        if in_project_section:
            # Bullet point or bold title indicating a project item
            if line.startswith(("-", "*", "•")) or (len(line) < 60 and line.isupper()) or (":" in line and len(line) < 50):
                if current_project:
                    projects.append(" ".join(current_project))
                    current_project = []
                current_project.append(line.lstrip("-*• "))
            elif current_project and len(current_project) < 3:
                current_project.append(line)

    if current_project:
        projects.append(" ".join(current_project))

    return projects[:5]

def extract_experience_heuristic(text: str) -> List[str]:
    """
    Identifies experience/internship entries using header heuristics.
    """
    experience = []
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    in_exp_section = False
    current_item = []

    stop_keywords = ["education", "skills", "projects", "certifications", "interests"]

    for line in lines:
        lower = line.lower()
        if any(h in lower for h in ["experience", "internship", "work history", "employment"]):
            in_exp_section = True
            continue
            
        if in_exp_section and any(stop in lower for stop in stop_keywords) and len(line) < 30:
            break
            
        if in_exp_section:
            if line.startswith(("-", "*", "•")) or (any(month in lower for month in ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]) and len(line) < 80):
                if current_item:
                    experience.append(" ".join(current_item))
                    current_item = []
                current_item.append(line.lstrip("-*• "))
            elif current_item and len(current_item) < 3:
                current_item.append(line)

    if current_item:
        experience.append(" ".join(current_item))

    return experience[:5]
