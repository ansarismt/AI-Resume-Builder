from __future__ import annotations


def detect_user_type(highest_education: str, years_of_experience: int) -> str:
    education = (highest_education or "").strip().lower()
    experience = max(int(years_of_experience or 0), 0)

    if experience > 0:
        return "professional"

    school_terms = {"10th", "10", "tenth", "12th", "12", "twelfth", "high school", "school"}
    college_terms = {
        "diploma",
        "degree",
        "college",
        "university",
        "bachelor",
        "master",
        "btech",
        "b.e",
        "be",
        "bsc",
        "msc",
        "mba",
        "phd",
    }

    if any(term in education for term in school_terms):
        return "school"

    if any(term in education for term in college_terms):
        return "college"

    return "college"
