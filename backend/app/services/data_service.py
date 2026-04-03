"""
Data service - handles dataset storage and management
Singleton pattern to maintain state across requests
"""
import pandas as pd
import numpy as np
from typing import Dict, Optional, List, Any
from app.models.schemas import DatasetInfo


class DataServiceMeta(type):
    """Metaclass for singleton pattern"""
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class DataService(metaclass=DataServiceMeta):
    """Service for managing uploaded datasets"""
    
    def __init__(self):
        self._datasets: Dict[str, Dict[str, Any]] = {}
    
    def store_dataset(self, dataset_id: str, df: pd.DataFrame, filename: str) -> None:
        """Store a dataset in memory"""
        self._datasets[dataset_id] = {
            'dataframe': df,
            'filename': filename
        }
    
    def get_dataset(self, dataset_id: str) -> Optional[pd.DataFrame]:
        """Retrieve a dataset by ID"""
        if dataset_id in self._datasets:
            return self._datasets[dataset_id]['dataframe'].copy()
        return None
    
    def get_dataset_info(self, dataset_id: str) -> Optional[DatasetInfo]:
        """Get metadata about a dataset"""
        if dataset_id not in self._datasets:
            return None
        
        df = self._datasets[dataset_id]['dataframe']
        filename = self._datasets[dataset_id]['filename']
        
        # Determine column types
        column_types = {}
        numeric_columns = []
        categorical_columns = []
        
        for col in df.columns:
            dtype = str(df[col].dtype)
            if pd.api.types.is_numeric_dtype(df[col]):
                column_types[col] = 'numeric'
                numeric_columns.append(col)
            elif pd.api.types.is_categorical_dtype(df[col]) or df[col].dtype == 'object':
                column_types[col] = 'categorical'
                categorical_columns.append(col)
            else:
                column_types[col] = dtype
        
        # Get preview (first 10 rows)
        preview = df.head(10).replace({np.nan: None}).to_dict(orient='records')
        
        return DatasetInfo(
            filename=filename,
            rows=len(df),
            columns=len(df.columns),
            column_names=list(df.columns),
            column_types=column_types,
            preview=preview,
            numeric_columns=numeric_columns,
            categorical_columns=categorical_columns
        )
    
    def list_datasets(self) -> List[Dict[str, Any]]:
        """List all stored datasets"""
        result = []
        for dataset_id, data in self._datasets.items():
            df = data['dataframe']
            result.append({
                'id': dataset_id,
                'filename': data['filename'],
                'rows': len(df),
                'columns': len(df.columns)
            })
        return result
    
    def delete_dataset(self, dataset_id: str) -> bool:
        """Delete a dataset"""
        if dataset_id in self._datasets:
            del self._datasets[dataset_id]
            return True
        return False
