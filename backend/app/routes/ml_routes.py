"""
ML routes - preprocessing and training
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PreprocessRequest, PreprocessResponse,
    TrainRequest, TrainResponse
)
from app.services.ml_pipeline import MLPipeline
from app.services.data_service import DataService

router = APIRouter()
data_service = DataService()
ml_pipeline = MLPipeline()


@router.post("/preprocess", response_model=PreprocessResponse)
async def preprocess_data(request: PreprocessRequest):
    """Preprocess dataset for ML training"""
    
    # Check if dataset exists
    df = data_service.get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Validate target column
    if request.target_column not in df.columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Target column '{request.target_column}' not found in dataset"
        )
    
    try:
        result = ml_pipeline.preprocess(
            dataset_id=request.dataset_id,
            df=df,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            missing_value_method=request.missing_value_method.value,
            normalization_method=request.normalization_method.value,
            test_size=request.test_size,
            random_state=request.random_state
        )
        
        return PreprocessResponse(
            success=True,
            message="Data preprocessed successfully",
            preprocessed_id=result['preprocessed_id'],
            train_samples=result['train_samples'],
            test_samples=result['test_samples'],
            feature_count=result['feature_count'],
            target_classes=result.get('target_classes')
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {str(e)}")


@router.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """Train ML model on preprocessed data"""
    
    # Check if preprocessed data exists
    if not ml_pipeline.has_preprocessed_data(request.preprocessed_id):
        raise HTTPException(status_code=404, detail="Preprocessed data not found")
    
    try:
        result = ml_pipeline.train(
            preprocessed_id=request.preprocessed_id,
            model_type=request.model_type.value,
            hyperparameters=request.hyperparameters or {}
        )
        
        return TrainResponse(
            success=True,
            message=f"Model trained successfully",
            model_id=result['model_id'],
            training_time=result['training_time']
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


@router.get("/models")
async def list_models():
    """List all trained models"""
    return {"models": ml_pipeline.list_models()}


@router.delete("/models/{model_id}")
async def delete_model(model_id: str):
    """Delete a trained model"""
    success = ml_pipeline.delete_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"success": True, "message": "Model deleted"}
