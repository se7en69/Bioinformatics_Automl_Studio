"""
Data handling routes - upload, preview, manage datasets
"""
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import io

from app.models.schemas import UploadResponse, DatasetInfo
from app.services.data_service import DataService

router = APIRouter()
data_service = DataService()


@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a CSV or TSV dataset file"""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    filename = file.filename.lower()
    if not (filename.endswith('.csv') or filename.endswith('.tsv') or filename.endswith('.txt')):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload CSV or TSV files."
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Detect delimiter
        delimiter = '\t' if filename.endswith('.tsv') or filename.endswith('.txt') else ','
        
        # Parse with pandas
        df = pd.read_csv(io.StringIO(content.decode('utf-8')), delimiter=delimiter)
        
        # Generate dataset ID
        dataset_id = str(uuid.uuid4())
        
        # Store dataset
        data_service.store_dataset(dataset_id, df, file.filename)
        
        # Get dataset info
        info = data_service.get_dataset_info(dataset_id)
        
        return UploadResponse(
            success=True,
            message=f"Successfully uploaded {file.filename}",
            dataset_id=dataset_id,
            info=info
        )
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="File is empty")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.get("/datasets")
async def list_datasets():
    """List all uploaded datasets"""
    return {"datasets": data_service.list_datasets()}


@router.get("/datasets/{dataset_id}")
async def get_dataset_info(dataset_id: str):
    """Get info about a specific dataset"""
    info = data_service.get_dataset_info(dataset_id)
    if not info:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return info


@router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset"""
    success = data_service.delete_dataset(dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"success": True, "message": "Dataset deleted"}
