"""
ML Pipeline - Core machine learning functionality
Handles preprocessing, training, and evaluation
"""
import uuid
import time
import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Optional, List, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from sklearn.impute import SimpleImputer


class MLPipelineMeta(type):
    """Metaclass for singleton pattern"""
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class MLPipeline(metaclass=MLPipelineMeta):
    """Core ML pipeline for bioinformatics data analysis"""
    
    def __init__(self):
        self._preprocessed_data: Dict[str, Dict[str, Any]] = {}
        self._trained_models: Dict[str, Dict[str, Any]] = {}
        self._output_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'outputs')
        os.makedirs(self._output_dir, exist_ok=True)
    
    def preprocess(
        self,
        dataset_id: str,
        df: pd.DataFrame,
        target_column: str,
        feature_columns: Optional[List[str]] = None,
        missing_value_method: str = 'mean',
        normalization_method: str = 'standard',
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Dict[str, Any]:
        """Preprocess data for ML training"""
        
        # Select features
        if feature_columns:
            X = df[feature_columns].copy()
        else:
            X = df.drop(columns=[target_column]).copy()
        
        y = df[target_column].copy()
        
        # Store original feature names
        feature_names = list(X.columns)
        
        # Handle categorical features in X
        categorical_cols = X.select_dtypes(include=['object', 'category']).columns
        label_encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le
        
        # Ensure all features are numeric
        X = X.apply(pd.to_numeric, errors='coerce')
        
        # Handle missing values
        if missing_value_method == 'mean':
            imputer = SimpleImputer(strategy='mean')
        elif missing_value_method == 'median':
            imputer = SimpleImputer(strategy='median')
        elif missing_value_method == 'zero':
            imputer = SimpleImputer(strategy='constant', fill_value=0)
        else:  # drop
            mask = ~X.isna().any(axis=1)
            X = X[mask]
            y = y[mask]
            imputer = None
        
        if imputer:
            X = pd.DataFrame(imputer.fit_transform(X), columns=feature_names)
        
        # Encode target variable if categorical
        target_encoder = None
        target_classes = None
        if y.dtype == 'object' or pd.api.types.is_categorical_dtype(y):
            target_encoder = LabelEncoder()
            y = target_encoder.fit_transform(y.astype(str))
            target_classes = list(target_encoder.classes_)
        else:
            target_classes = [str(c) for c in sorted(pd.Series(y).unique())]
        
        # Normalize features
        scaler = None
        if normalization_method == 'standard':
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
        elif normalization_method == 'minmax':
            scaler = MinMaxScaler()
            X_scaled = scaler.fit_transform(X)
        else:
            X_scaled = X.values
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Generate preprocessed ID
        preprocessed_id = str(uuid.uuid4())
        
        # Store preprocessed data
        self._preprocessed_data[preprocessed_id] = {
            'dataset_id': dataset_id,
            'X_train': X_train,
            'X_test': X_test,
            'y_train': y_train,
            'y_test': y_test,
            'feature_names': feature_names,
            'target_column': target_column,
            'target_classes': target_classes,
            'target_encoder': target_encoder,
            'scaler': scaler,
            'imputer': imputer,
            'label_encoders': label_encoders
        }
        
        return {
            'preprocessed_id': preprocessed_id,
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'feature_count': len(feature_names),
            'target_classes': target_classes
        }
    
    def has_preprocessed_data(self, preprocessed_id: str) -> bool:
        """Check if preprocessed data exists"""
        return preprocessed_id in self._preprocessed_data
    
    def train(
        self,
        preprocessed_id: str,
        model_type: str = 'random_forest',
        hyperparameters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Train ML model"""
        
        if preprocessed_id not in self._preprocessed_data:
            raise ValueError("Preprocessed data not found")
        
        data = self._preprocessed_data[preprocessed_id]
        X_train = data['X_train']
        y_train = data['y_train']
        X_test = data['X_test']
        y_test = data['y_test']
        
        hyperparameters = hyperparameters or {}
        
        # Create model
        if model_type == 'random_forest':
            model = RandomForestClassifier(
                n_estimators=hyperparameters.get('n_estimators', 100),
                max_depth=hyperparameters.get('max_depth', None),
                min_samples_split=hyperparameters.get('min_samples_split', 2),
                random_state=42,
                n_jobs=-1
            )
        elif model_type == 'svm':
            model = SVC(
                C=hyperparameters.get('C', 1.0),
                kernel=hyperparameters.get('kernel', 'rbf'),
                gamma=hyperparameters.get('gamma', 'scale'),
                random_state=42
            )
        elif model_type == 'logistic_regression':
            model = LogisticRegression(
                C=hyperparameters.get('C', 1.0),
                max_iter=hyperparameters.get('max_iter', 1000),
                random_state=42,
                n_jobs=-1
            )
        elif model_type == 'kmeans':
            n_clusters = hyperparameters.get('n_clusters', len(set(y_train)))
            model = KMeans(
                n_clusters=n_clusters,
                random_state=42,
                n_init=10
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        # Train model
        start_time = time.time()
        model.fit(X_train, y_train)
        training_time = time.time() - start_time
        
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Generate model ID
        model_id = str(uuid.uuid4())
        
        # Store trained model and results
        self._trained_models[model_id] = {
            'model': model,
            'model_type': model_type,
            'preprocessed_id': preprocessed_id,
            'y_test': y_test,
            'y_pred': y_pred,
            'feature_names': data['feature_names'],
            'target_classes': data['target_classes'],
            'X_test': X_test,
            'training_time': training_time
        }
        
        return {
            'model_id': model_id,
            'training_time': round(training_time, 3)
        }
    
    def has_model(self, model_id: str) -> bool:
        """Check if model exists"""
        return model_id in self._trained_models
    
    def get_metrics(self, model_id: str) -> Dict[str, Any]:
        """Get evaluation metrics for a model"""
        
        if model_id not in self._trained_models:
            raise ValueError("Model not found")
        
        data = self._trained_models[model_id]
        y_test = data['y_test']
        y_pred = data['y_pred']
        target_classes = data['target_classes']
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        conf_matrix = confusion_matrix(y_test, y_pred).tolist()
        
        # Classification report
        report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        
        return {
            'accuracy': round(accuracy, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'confusion_matrix': conf_matrix,
            'class_labels': target_classes,
            'classification_report': report
        }
    
    def get_feature_importance(self, model_id: str) -> Dict[str, Any]:
        """Get feature importance rankings"""
        
        if model_id not in self._trained_models:
            raise ValueError("Model not found")
        
        data = self._trained_models[model_id]
        model = data['model']
        feature_names = data['feature_names']
        model_type = data['model_type']
        
        # Get feature importances based on model type
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_).mean(axis=0) if model.coef_.ndim > 1 else np.abs(model.coef_)
        else:
            raise ValueError(f"Model type '{model_type}' does not support feature importance")
        
        # Sort by importance
        feature_importance = sorted(
            zip(feature_names, importances),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            'model_id': model_id,
            'features': [
                {'feature': name, 'importance': round(float(imp), 6)}
                for name, imp in feature_importance
            ],
            'model_type': model_type
        }
    
    def get_model_data(self, model_id: str) -> Dict[str, Any]:
        """Get all data associated with a model"""
        if model_id not in self._trained_models:
            return None
        return self._trained_models[model_id]
    
    def get_preprocessed_data(self, preprocessed_id: str) -> Dict[str, Any]:
        """Get preprocessed data"""
        if preprocessed_id not in self._preprocessed_data:
            return None
        return self._preprocessed_data[preprocessed_id]
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List all trained models"""
        result = []
        for model_id, data in self._trained_models.items():
            result.append({
                'id': model_id,
                'model_type': data['model_type'],
                'training_time': data['training_time']
            })
        return result
    
    def delete_model(self, model_id: str) -> bool:
        """Delete a trained model"""
        if model_id in self._trained_models:
            del self._trained_models[model_id]
            return True
        return False
    
    def export_results_csv(self, model_id: str) -> str:
        """Export results to CSV"""
        
        if model_id not in self._trained_models:
            raise ValueError("Model not found")
        
        data = self._trained_models[model_id]
        metrics = self.get_metrics(model_id)
        
        # Create results dataframe
        results_df = pd.DataFrame({
            'Metric': ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
            'Value': [
                metrics['accuracy'],
                metrics['precision'],
                metrics['recall'],
                metrics['f1_score']
            ]
        })
        
        filepath = os.path.join(self._output_dir, f'results_{model_id}.csv')
        results_df.to_csv(filepath, index=False)
        
        return filepath
    
    def export_model(self, model_id: str) -> str:
        """Export trained model as pickle"""
        
        if model_id not in self._trained_models:
            raise ValueError("Model not found")
        
        data = self._trained_models[model_id]
        model = data['model']
        
        filepath = os.path.join(self._output_dir, f'model_{model_id}.pkl')
        joblib.dump(model, filepath)
        
        return filepath
