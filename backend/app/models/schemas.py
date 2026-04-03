"""
Pydantic schemas for API request/response models
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from enum import Enum


class PreprocessingMethod(str, Enum):
    MEAN = "mean"
    MEDIAN = "median"
    DROP = "drop"
    ZERO = "zero"


class NormalizationMethod(str, Enum):
    STANDARD = "standard"
    MINMAX = "minmax"
    NONE = "none"


class ModelType(str, Enum):
    RANDOM_FOREST = "random_forest"
    SVM = "svm"
    LOGISTIC_REGRESSION = "logistic_regression"
    KMEANS = "kmeans"


# Data Upload
class DatasetInfo(BaseModel):
    filename: str
    rows: int
    columns: int
    column_names: List[str]
    column_types: Dict[str, str]
    preview: List[Dict[str, Any]]
    numeric_columns: List[str]
    categorical_columns: List[str]


class UploadResponse(BaseModel):
    success: bool
    message: str
    dataset_id: str
    info: DatasetInfo


# Preprocessing
class PreprocessRequest(BaseModel):
    dataset_id: str
    target_column: str
    feature_columns: Optional[List[str]] = None
    missing_value_method: PreprocessingMethod = PreprocessingMethod.MEAN
    normalization_method: NormalizationMethod = NormalizationMethod.STANDARD
    test_size: float = 0.2
    random_state: int = 42


class PreprocessResponse(BaseModel):
    success: bool
    message: str
    preprocessed_id: str
    train_samples: int
    test_samples: int
    feature_count: int
    target_classes: Optional[List[str]] = None


# Training
class TrainRequest(BaseModel):
    preprocessed_id: str
    model_type: ModelType = ModelType.RANDOM_FOREST
    hyperparameters: Optional[Dict[str, Any]] = None


class TrainResponse(BaseModel):
    success: bool
    message: str
    model_id: str
    training_time: float


# Results
class MetricsResponse(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    class_labels: List[str]
    classification_report: Dict[str, Any]


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class FeatureImportanceResponse(BaseModel):
    model_id: str
    features: List[FeatureImportance]
    model_type: str


class PCAResponse(BaseModel):
    components: List[Dict[str, float]]
    explained_variance: List[float]
    labels: List[str]


class PlotData(BaseModel):
    plot_type: str
    data: Dict[str, Any]
