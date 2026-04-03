"""
Results routes - metrics, visualizations, exports
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import os

from app.models.schemas import (
    MetricsResponse, FeatureImportanceResponse, PCAResponse
)
from app.services.ml_pipeline import MLPipeline
from app.services.visualization_service import VisualizationService

router = APIRouter()
ml_pipeline = MLPipeline()
viz_service = VisualizationService()


@router.get("/results/{model_id}/metrics", response_model=MetricsResponse)
async def get_metrics(model_id: str):
    """Get evaluation metrics for a trained model"""
    
    if not ml_pipeline.has_model(model_id):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        metrics = ml_pipeline.get_metrics(model_id)
        return MetricsResponse(**metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting metrics: {str(e)}")


@router.get("/results/{model_id}/feature-importance", response_model=FeatureImportanceResponse)
async def get_feature_importance(model_id: str):
    """Get feature importance rankings"""
    
    if not ml_pipeline.has_model(model_id):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        importance = ml_pipeline.get_feature_importance(model_id)
        return FeatureImportanceResponse(**importance)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting feature importance: {str(e)}")


@router.get("/results/{model_id}/confusion-matrix")
async def get_confusion_matrix_plot(model_id: str):
    """Get confusion matrix plot data"""
    
    if not ml_pipeline.has_model(model_id):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        plot_data = viz_service.generate_confusion_matrix(model_id, ml_pipeline)
        return {"plot_type": "confusion_matrix", "data": plot_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plot: {str(e)}")


@router.get("/results/{model_id}/feature-importance-plot")
async def get_feature_importance_plot(model_id: str, top_n: int = 20):
    """Get feature importance plot data"""
    
    if not ml_pipeline.has_model(model_id):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        plot_data = viz_service.generate_feature_importance_plot(model_id, ml_pipeline, top_n)
        return {"plot_type": "feature_importance", "data": plot_data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plot: {str(e)}")


@router.get("/results/{model_id}/pca")
async def get_pca_plot(model_id: str):
    """Get PCA visualization data"""
    
    if not ml_pipeline.has_model(model_id):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        plot_data = viz_service.generate_pca_plot(model_id, ml_pipeline)
        return {"plot_type": "pca", "data": plot_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PCA plot: {str(e)}")


@router.get("/results/{model_id}/export/csv")
async def export_results_csv(model_id: str):
    """Export results as CSV"""
    
    if not ml_pipeline.has_model(model_id):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        filepath = ml_pipeline.export_results_csv(model_id)
        return FileResponse(
            filepath, 
            media_type='text/csv',
            filename=f"results_{model_id}.csv"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting results: {str(e)}")


@router.get("/results/{model_id}/export/model")
async def export_model(model_id: str):
    """Export trained model as pickle file"""
    
    if not ml_pipeline.has_model(model_id):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        filepath = ml_pipeline.export_model(model_id)
        return FileResponse(
            filepath,
            media_type='application/octet-stream',
            filename=f"model_{model_id}.pkl"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting model: {str(e)}")
