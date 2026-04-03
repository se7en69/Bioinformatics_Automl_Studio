# Bioinformatics AutoML Studio

A modern desktop application for machine learning analysis on biological datasets (gene expression, RNA-seq, tabular omics data) without requiring programming knowledge.

**Developed by Abdul Rehman Ikram**
- GitHub: https://github.com/se7en69
- Portfolio: https://abdul7.netlify.app/

## Features

- **Homepage Dashboard**: Modern entry point with quick actions and session status
- **Data Upload**: Import CSV/TSV files, preview datasets, auto-detect column types
- **Preprocessing**: Handle missing values, normalize data, encode categorical variables
- **ML Models**: Random Forest, SVM, Logistic Regression, K-Means clustering
- **Visualization**: Confusion matrix, feature importance, PCA plots (Plotly)
- **Export**: Download results as CSV, trained models as pickle files
- **Desktop App**: Standalone Windows executable, works fully offline

## Quick Start

### Option 1: Run Desktop App (Recommended)

Navigate to `frontend/dist/win-unpacked/` and double-click:
```
Bioinformatics AutoML Studio.exe
```

### Option 2: Development Mode

**Prerequisites:**
- Python 3.8+
- Node.js 16+

**Installation:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd frontend
npm install --legacy-peer-deps
```

**Running:**
```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn main:app --port 8000

# Terminal 2 - Frontend
cd frontend
npm start
```

Then open http://localhost:3000

## Build Desktop App

```powershell
# Build backend executable
cd backend
pip install pyinstaller
pyinstaller backend.spec --clean --noconfirm

# Build Electron app
cd frontend
npm run build
npx electron-builder --win --dir
```

Output: `frontend/dist/win-unpacked/Bioinformatics AutoML Studio.exe`

## Project Structure

```
automl/
├── backend/
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # ML pipeline logic
│   │   ├── models/         # Pydantic schemas
│   │   └── utils/          # Helper functions
│   ├── main.py             # FastAPI entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── styles/         # CSS styles
│   ├── public/
│   ├── electron.js         # Electron main process
│   └── package.json
├── data/                   # Sample datasets
├── outputs/                # Generated results
└── start.bat               # Startup script
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload dataset |
| `/api/preprocess` | POST | Preprocess data |
| `/api/train` | POST | Train ML model |
| `/api/results/{id}/metrics` | GET | Get evaluation metrics |
| `/api/results/{id}/feature-importance` | GET | Get feature rankings |
| `/api/results/{id}/confusion-matrix` | GET | Get confusion matrix plot |
| `/api/results/{id}/pca` | GET | Get PCA visualization |

## Usage Guide

1. **Upload Data**: Drag & drop your CSV/TSV file or click to browse
2. **Configure Preprocessing**: Select target column, normalization method, test split
3. **Train Model**: Choose algorithm and hyperparameters, click Train
4. **View Results**: Explore metrics, confusion matrix, feature importance, PCA

## Sample Dataset

A sample gene expression dataset is included in `data/sample_gene_expression.csv` with:
- 20 genes (rows)
- 10 samples (columns)
- Binary classification: cancer vs normal

## Building for Desktop (Electron)

```bash
cd frontend
npm run build
npm run package
```

The executable will be in `frontend/dist/`.

## Technologies

- **Backend**: FastAPI, scikit-learn, pandas, NumPy
- **Frontend**: React, Plotly.js, Axios, Lucide icons
- **Desktop**: Electron

## License

MIT
