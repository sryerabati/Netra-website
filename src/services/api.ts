interface AnalysisResult {
  prediction: string;
  heatmapUrl?: string;
}

export const analyzeImage = async (_file: File): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const predictions = [
        'No DR',
        'Mild',
        'Moderate',
        'Severe',
        'Proliferative DR',
      ];

      const randomResult = predictions[Math.floor(Math.random() * predictions.length)];
      resolve({ prediction: randomResult });
    }, 2000);
  });
};
