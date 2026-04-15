# EduStats

EduStats is a browser-based student performance tracker for teachers and schools. It helps you collect marks, run class analysis, visualize trends, and export polished PDF reports without a backend.

The app is designed for real classroom workflows: quick setup, bulk entry/import, meaningful statistics, and shareable outputs for students, parents, and school administration.

## Why This Project Exists

Many teachers manage marks in spreadsheets but still need to manually compute insights and prepare report summaries. EduStats exists to reduce that manual work by combining:

- structured mark entry
- automatic statistical analysis
- visual dashboards
- one-click PDF report generation

All inside a single static web app.

## Key Features

- Multi-step workflow: Setup -> Enter Marks -> Analysis -> Graphs -> Reports -> Reviews
- Subject management with per-subject maximum marks and fail thresholds
- Default fail mark logic based on 40% of each subject max mark
- CSV import/export for marks and thresholds
- Saved entry history (up to 5 snapshots) in local storage
- Class analysis with:
  - normalized means (supports different subject max marks)
  - median, mode, standard deviation
  - quartiles, IQR, and outlier detection
  - pass/fail counts and rates per subject
  - class ranking and support-focused sorting/filtering
- Graphs (Chart.js): distribution, cumulative frequency, subject performance, best-fit trend, radar
- PDF reports (jsPDF + AutoTable):
  - individual student report
  - whole class report
- Theme toggle (light/dark), compact table mode, responsive UI, keyboard navigation, reduced-motion support

## Tech Stack

- HTML/CSS/JavaScript (vanilla)
- Web Worker for non-blocking analysis: `analysis.worker.js`
- Shared core modules: `js/core/stats.js`, `js/core/csv-utils.js`
- Charting: Chart.js (self-hosted in `lib/`)
- PDF generation: jsPDF + jsPDF AutoTable (self-hosted in `lib/`)
- CSV parsing: Papa Parse (self-hosted in `lib/`)
- Local persistence: `localStorage`

## Project Structure

```text
.
├── index.html            # Primary source page for development + release
├── analysis.worker.js    # Worker-based analysis engine
├── js/core/              # Shared analysis + CSV modules
├── tests/                # Unit tests
├── release.ps1           # Release script: stage + commit + push
├── icons/edu-outline/    # UI icon set
├── lib/                  # Self-hosted third-party libs
├── favicon.ico
└── favicon.svg
```

## Getting Started

### 1. Clone

```bash
git clone https://github.com/muhammadhamza27-commits/EduStats.git
cd EduStats
```

### 2. Run Locally

Use a local static server (recommended) instead of opening the file directly, so browser worker/loading behavior is consistent.

Example with Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/index.html
```

## How to Use

1. Setup class info (school, teacher, class, term).
2. Add subjects (up to 12), then adjust max/fail marks if needed.
3. Enter student marks manually or import a CSV.
4. Click Analyze Data.
5. Review analysis tables and graph insights.
6. Download student or class PDF reports.

## CSV Format

EduStats supports threshold metadata lines plus the student data table.

### Threshold Rows (optional, repeat per subject)

```csv
__EDUSTATS_THRESHOLD__,Mathematics,100,40
__EDUSTATS_THRESHOLD__,English,100,40
```

Format:

```text
__EDUSTATS_THRESHOLD__,<Subject>,<MaxMark>,<FailMark>
```

### Student Header Row (required)

```csv
Student ID,Full Name,Mathematics,English,Mean
```

`Mean` is optional in imported files and is recomputed by EduStats.

### Student Rows

```csv
G9B001,Aisha Mwangi,91,84,
G9B002,Brian Otieno,67,58,
```

Blank marks are allowed and treated as missing (not counted in averages).

## Excel Test Data Extraction

The repository now includes a workbook extractor for the sample Excel files in `RawTestData/`.

- Script: `tools/extract_raw_test_data.py`
- Input: `c:\Users\Lenovo\Desktop\Code\RawTestData`
- Output: `generated-test-data/`

For each workbook, the script creates:

- `edustats-import.csv` for direct import into EduStats
- `students-raw.csv` with the full extracted student record
- `manifest.csv` and `summary.json` for review

Run it with:

```powershell
& .\.venv\Scripts\python.exe .\Projects\tools\extract_raw_test_data.py
```

## Data and Privacy Notes

EduStats is frontend-only and stores working data in browser local storage (history, theme, view preferences).

External services/resources used by the app:

- Google Fonts
- GoatCounter analytics script (disabled by default, user opt-in from app settings)
- Review links (Google Form and Gmail compose)

Charting/PDF/CSV dependencies are self-hosted in `lib/` for reliability and offline-friendly operation.

## Development and Release Workflow

`index.html` is the only source page and release target.

Use the provided PowerShell script:

```powershell
./release.ps1
```

What it does:

- verifies required files exist
- stages app/runtime/test/workflow updates
- pushes to `origin/main`

Optional flags:

```powershell
./release.ps1 -Message "Release: improve analysis tables"
./release.ps1 -NoPush
```

## Testing

Run automated checks from `Projects/`:

```bash
npm install
npm test
npm run smoke
```

CI runs these commands in GitHub Actions via `.github/workflows/ci.yml`.

## Contributing

Contributions are welcome.

Suggested flow:

1. Fork the repo
2. Create a feature branch
3. Make focused changes
4. Test in browser (desktop + mobile widths)
5. Submit a pull request with a clear summary

## License

This project is licensed for personal and non-commercial institutional use only.

See [LICENSE](LICENSE) for the full text.