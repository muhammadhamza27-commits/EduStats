# Grade 9 Predictive Benchmark

This is a deterministic synthetic benchmark for testing EduStats v2 predictive workflows.
It contains 30 anonymized Grade 9 students, five subjects, and nine monthly snapshots from September 2025 through May 2026.

## Files

- `month-01-2025-09.csv` through `month-09-2026-05.csv`: directly uploadable EduStats snapshots. Upload one month at a time.
- `longitudinal-records.csv`: one long-format row per student, month, and subject (1,350 records) for history ingestion and offline analysis.
- `manifest.csv`: monthly file index.

## Subjects and thresholds

- English, Math, Bio, Chemistry, Physics
- Maximum mark: 100 for every subject
- Fail mark: 40 for every subject
- Grade scale used for reference: A* 90, A 80, B 70, C 60, D 50, E 40, U below 40

## Recommended app test

1. Upload `month-01-2025-09.csv` and run analysis.
2. Save or retain that term snapshot.
3. Repeat for months 2 through 8.
4. Upload `month-09-2026-05.csv` as the current assessment.
5. Compare forecast scores, predicted grades, risk flags, and intervention messages with the final-month marks.

The first snapshot can only produce a baseline estimate. Trend-sensitive predictions become meaningful after at least two snapshots and are more useful after three or more.

## Expected patterns

- `G9-003`, `G9-006`, `G9-017`, `G9-022`, `G9-026`, and `G9-029` generally improve.
- `G9-007`, `G9-014`, `G9-018`, `G9-021`, and `G9-025` generally decline.
- `G9-009`, `G9-016`, and `G9-022` should remain useful borderline/intervention cases.
- Subject offsets create realistic uneven profiles instead of identical marks across subjects.

The marks are synthetic and should not be treated as real student data or as a claim about actual school performance.

## Recreate the data

From the EduStats project root:

```powershell
python tools/generate_grade9_predictive_benchmark.py
```

The generator uses a fixed random seed scheme, so regeneration produces the same values.
