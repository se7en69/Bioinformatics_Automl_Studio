"""
Bioinformatics AutoML Backend
FastAPI application entry point
"""
import sys
import os

# Handle PyInstaller frozen app paths
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    BASE_DIR = os.path.dirname(sys.executable)
else:
    # Running in normal Python environment
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Add base directory to path for imports
sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import data_routes, ml_routes, results_routes

app = FastAPI(
    title="Bioinformatics AutoML API",
    description="API for machine learning analysis on biological datasets",
    version="1.0.0"
)

# CORS configuration for Electron frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data_routes.router, prefix="/api", tags=["Data"])
app.include_router(ml_routes.router, prefix="/api", tags=["ML"])
app.include_router(results_routes.router, prefix="/api", tags=["Results"])


@app.get("/")
async def root():
    return {"message": "Bioinformatics AutoML API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")
