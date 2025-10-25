interface AnalysisResult {
  prediction: string;
  confidence: number;
  heatmapUrl?: string;
}

export const analyzeImage = async (_file: File): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const predictions = [
        { prediction: 'No Diabetic Retinopathy Detected', confidence: 0.94 },
        { prediction: 'Mild Diabetic Retinopathy', confidence: 0.87 },
        { prediction: 'Moderate Diabetic Retinopathy', confidence: 0.82 },
        { prediction: 'Severe Diabetic Retinopathy', confidence: 0.91 },
        { prediction: 'Proliferative Diabetic Retinopathy', confidence: 0.88 },
      ];

      const randomResult = predictions[Math.floor(Math.random() * predictions.length)];
      resolve(randomResult);
    }, 2000);
  });
};
