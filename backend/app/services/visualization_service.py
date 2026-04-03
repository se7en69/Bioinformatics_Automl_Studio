"""
Visualization service - generates plot data for frontend
"""
import numpy as np
from typing import Dict, Any, List
from sklearn.decomposition import PCA


class VisualizationService:
    """Service for generating visualization data"""
    
    def generate_confusion_matrix(self, model_id: str, ml_pipeline) -> Dict[str, Any]:
        """Generate confusion matrix plot data for Plotly"""
        
        data = ml_pipeline.get_model_data(model_id)
        if not data:
            raise ValueError("Model not found")
        
        y_test = data['y_test']
        y_pred = data['y_pred']
        target_classes = data['target_classes']
        
        # Compute confusion matrix
        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # Format for Plotly heatmap
        return {
            'z': cm.tolist(),
            'x': target_classes,
            'y': target_classes,
            'type': 'heatmap',
            'colorscale': 'Blues',
            'showscale': True,
            'annotations': self._generate_cm_annotations(cm, target_classes)
        }
    
    def _generate_cm_annotations(self, cm: np.ndarray, labels: List[str]) -> List[Dict]:
        """Generate annotations for confusion matrix cells"""
        annotations = []
        for i in range(len(labels)):
            for j in range(len(labels)):
                annotations.append({
                    'x': labels[j],
                    'y': labels[i],
                    'text': str(cm[i, j]),
                    'font': {'color': 'white' if cm[i, j] > cm.max() / 2 else 'black'},
                    'showarrow': False
                })
        return annotations
    
    def generate_feature_importance_plot(
        self, 
        model_id: str, 
        ml_pipeline, 
        top_n: int = 20
    ) -> Dict[str, Any]:
        """Generate feature importance bar chart data for Plotly"""
        
        importance_data = ml_pipeline.get_feature_importance(model_id)
        features = importance_data['features'][:top_n]
        
        # Reverse for horizontal bar chart (most important at top)
        features = features[::-1]
        
        return {
            'x': [f['importance'] for f in features],
            'y': [f['feature'] for f in features],
            'type': 'bar',
            'orientation': 'h',
            'marker': {
                'color': 'rgb(55, 83, 109)',
                'line': {'color': 'rgb(8, 48, 107)', 'width': 1.5}
            }
        }
    
    def generate_pca_plot(self, model_id: str, ml_pipeline) -> Dict[str, Any]:
        """Generate PCA 2D visualization data for Plotly"""
        
        data = ml_pipeline.get_model_data(model_id)
        if not data:
            raise ValueError("Model not found")
        
        X_test = data['X_test']
        y_test = data['y_test']
        target_classes = data['target_classes']
        
        # Perform PCA
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_test)
        
        # Create traces for each class
        traces = []
        unique_labels = np.unique(y_test)
        
        colors = [
            'rgb(31, 119, 180)', 'rgb(255, 127, 14)', 'rgb(44, 160, 44)',
            'rgb(214, 39, 40)', 'rgb(148, 103, 189)', 'rgb(140, 86, 75)',
            'rgb(227, 119, 194)', 'rgb(127, 127, 127)', 'rgb(188, 189, 34)',
            'rgb(23, 190, 207)'
        ]
        
        for i, label in enumerate(unique_labels):
            mask = y_test == label
            class_name = target_classes[label] if label < len(target_classes) else str(label)
            traces.append({
                'x': X_pca[mask, 0].tolist(),
                'y': X_pca[mask, 1].tolist(),
                'mode': 'markers',
                'type': 'scatter',
                'name': class_name,
                'marker': {
                    'color': colors[i % len(colors)],
                    'size': 8,
                    'opacity': 0.7
                }
            })
        
        return {
            'traces': traces,
            'explained_variance': pca.explained_variance_ratio_.tolist(),
            'layout': {
                'xaxis': {'title': f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)'},
                'yaxis': {'title': f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)'},
                'title': 'PCA Visualization'
            }
        }
    
    def generate_clustering_plot(self, model_id: str, ml_pipeline) -> Dict[str, Any]:
        """Generate clustering visualization data for Plotly"""
        
        data = ml_pipeline.get_model_data(model_id)
        if not data:
            raise ValueError("Model not found")
        
        if data['model_type'] != 'kmeans':
            raise ValueError("Clustering plot only available for K-Means models")
        
        model = data['model']
        X_test = data['X_test']
        
        # Get cluster labels
        labels = model.predict(X_test)
        
        # Reduce to 2D for visualization
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_test)
        centers_pca = pca.transform(model.cluster_centers_)
        
        # Create traces
        traces = []
        colors = [
            'rgb(31, 119, 180)', 'rgb(255, 127, 14)', 'rgb(44, 160, 44)',
            'rgb(214, 39, 40)', 'rgb(148, 103, 189)', 'rgb(140, 86, 75)'
        ]
        
        for cluster in range(model.n_clusters):
            mask = labels == cluster
            traces.append({
                'x': X_pca[mask, 0].tolist(),
                'y': X_pca[mask, 1].tolist(),
                'mode': 'markers',
                'type': 'scatter',
                'name': f'Cluster {cluster}',
                'marker': {
                    'color': colors[cluster % len(colors)],
                    'size': 8,
                    'opacity': 0.7
                }
            })
        
        # Add cluster centers
        traces.append({
            'x': centers_pca[:, 0].tolist(),
            'y': centers_pca[:, 1].tolist(),
            'mode': 'markers',
            'type': 'scatter',
            'name': 'Centers',
            'marker': {
                'color': 'black',
                'size': 15,
                'symbol': 'x'
            }
        })
        
        return {
            'traces': traces,
            'layout': {
                'xaxis': {'title': 'PC1'},
                'yaxis': {'title': 'PC2'},
                'title': 'K-Means Clustering'
            }
        }
