"""Generate a deterministic, synthetic Grade 9 longitudinal prediction benchmark."""
from __future__ import annotations

import csv
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "generated-test-data" / "grade9_predictive_9_months"
MONTHS = ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]
SUBJECTS = ["English", "Math", "Bio", "Chemistry", "Physics"]
MAX_MARK = 100
FAIL_MARK = 40
GRADE_SCALE = [("A*", 90), ("A", 80), ("B", 70), ("C", 60), ("D", 50), ("E", 40), ("U", 0)]

# Baseline, trend, and subject profile intentionally include strong, steady,
# improving, declining, uneven, and intervention-sensitive learners.
PROFILES = [
    ("G9-001", "Amina Rahman", 86, 0.4, [2, 1, 1, 0, -1]),
    ("G9-002", "Bilal Ahmed", 74, 0.8, [1, 0, 2, -2, -1]),
    ("G9-003", "Celia Khan", 63, 1.8, [0, 2, 3, -1, -2]),
    ("G9-004", "Daniyal Iqbal", 78, -0.5, [-1, 1, 0, 2, -3]),
    ("G9-005", "Esha Malik", 91, 0.1, [1, 0, -1, 0, 1]),
    ("G9-006", "Farhan Saeed", 56, 2.2, [-2, 1, 2, -1, 0]),
    ("G9-007", "Hiba Noor", 68, -1.5, [2, 1, -2, 0, -1]),
    ("G9-008", "Ibrahim Shah", 82, 0.3, [-2, 1, 0, 2, -1]),
    ("G9-009", "Javeria Ali", 48, 1.5, [0, 2, -1, 1, -2]),
    ("G9-010", "Kamil Hussain", 71, -0.2, [1, -2, 1, 0, 2]),
    ("G9-011", "Laiba Tariq", 88, -0.3, [2, 0, 1, -1, 0]),
    ("G9-012", "Musa Yousaf", 61, 0.5, [-1, 2, 0, -2, 1]),
    ("G9-013", "Nadia Faisal", 77, 1.1, [0, 1, -1, 2, -2]),
    ("G9-014", "Owais Raza", 66, -2.0, [1, -1, 2, 0, -2]),
    ("G9-015", "Parisa Zaman", 84, 0.6, [-1, 2, 0, -1, 1]),
    ("G9-016", "Qasim Nadeem", 53, 0.1, [2, -2, 0, 1, -1]),
    ("G9-017", "Rida Aslam", 73, 1.4, [1, 0, -2, 2, -1]),
    ("G9-018", "Saad Mahmood", 59, -0.8, [-1, 1, 2, -2, 0]),
    ("G9-019", "Tania Javed", 95, -0.1, [0, 1, 0, -1, 1]),
    ("G9-020", "Usman Latif", 69, 0.9, [-2, 0, 1, 2, -1]),
    ("G9-021", "Warda Yasin", 81, -1.0, [2, -1, 0, 1, -2]),
    ("G9-022", "Yahya Qureshi", 45, 2.0, [-1, 0, 2, -2, 1]),
    ("G9-023", "Zara Saif", 75, 0.2, [1, 2, -1, 0, -2]),
    ("G9-024", "Adnan Mir", 64, -0.4, [0, -1, 2, 1, -2]),
    ("G9-025", "Bushra Hamid", 87, -1.8, [2, 0, 1, -2, -1]),
    ("G9-026", "Hamza Ilyas", 52, 1.0, [-2, 1, 0, 2, -1]),
    ("G9-027", "Mariam Rauf", 70, 0.7, [1, -1, 2, -2, 0]),
    ("G9-028", "Noman Akhtar", 80, -0.6, [-1, 2, -1, 1, 0]),
    ("G9-029", "Sana Waheed", 58, 1.7, [0, -2, 1, 2, -1]),
    ("G9-030", "Taha Siddiqui", 73, -0.1, [2, -1, 0, 1, -2]),
]


def grade_for(mean: float) -> str:
    for label, minimum in GRADE_SCALE:
        if mean >= minimum:
            return label
    return "U"


def mark_for(profile_index: int, baseline: float, trend: float, offsets: list[int], month_index: int, subject_index: int) -> int:
    rng = random.Random(9000 + profile_index * 101 + month_index * 17 + subject_index)
    seasonal = math.sin((month_index + subject_index) * 0.9) * 1.4
    noise = rng.uniform(-2.8, 2.8)
    value = baseline + (trend * month_index) + offsets[subject_index] + seasonal + noise
    return max(18, min(99, round(value)))


def write_import_csv(month_index: int, records: list[dict[str, object]]) -> None:
    path = ROOT / f"month-{month_index + 1:02d}-{MONTHS[month_index]}.csv"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        for subject in SUBJECTS:
            writer.writerow(["__EDUSTATS_THRESHOLD__", subject, MAX_MARK, FAIL_MARK])
        writer.writerow(["Student ID", "Full Name", *SUBJECTS, "Mean"])
        for record in records:
            marks = [record[subject] for subject in SUBJECTS]
            writer.writerow([record["student_id"], record["name"], *marks, f"{sum(marks) / len(marks):.2f}"])


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    long_rows: list[dict[str, object]] = []
    manifest_rows: list[list[object]] = []

    for month_index, month in enumerate(MONTHS):
        records: list[dict[str, object]] = []
        for profile_index, (student_id, name, baseline, trend, offsets) in enumerate(PROFILES):
            marks = {
                subject: mark_for(profile_index, baseline, trend, offsets, month_index, subject_index)
                for subject_index, subject in enumerate(SUBJECTS)
            }
            mean = sum(marks.values()) / len(marks)
            record = {"student_id": student_id, "name": name, **marks}
            records.append(record)
            for subject in SUBJECTS:
                long_rows.append({
                    "student_id": student_id,
                    "student_name": name,
                    "grade": 9,
                    "month": month,
                    "month_number": month_index + 1,
                    "subject": subject,
                    "mark": marks[subject],
                    "max_mark": MAX_MARK,
                    "fail_mark": FAIL_MARK,
                    "monthly_mean": f"{mean:.2f}",
                    "monthly_grade": grade_for(mean),
                })
        write_import_csv(month_index, records)
        manifest_rows.append([month_index + 1, month, f"month-{month_index + 1:02d}-{month}.csv", len(records), "uploadable"])

    with (ROOT / "longitudinal-records.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(long_rows[0]))
        writer.writeheader()
        writer.writerows(long_rows)

    with (ROOT / "manifest.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["month_number", "month", "file", "student_count", "purpose"])
        writer.writerows(manifest_rows)

    print(f"Generated {len(MONTHS)} monthly files and {len(long_rows)} longitudinal records in {ROOT}")


if __name__ == "__main__":
    main()
