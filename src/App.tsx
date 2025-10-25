import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { UploadCard } from './components/UploadCard';
import { AnalyzeButton } from './components/AnalyzeButton';
import { ResultCard } from './components/ResultCard';
import { Footer } from './components/Footer';
import { analyzeImage } from './services/api';

interface AnalysisResult {
  prediction: string;
  confidence: number;
}

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await analyzeImage(selectedImage);
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg to-light-bg-end dark:from-dark-bg dark:to-dark-bg-end transition-colors duration-500">
      <Navbar />

      <main className="pt-32 pb-12 px-6">
        <section id="home">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-light-text dark:text-dark-text mb-4">
              Netra
            </h1>
            <p className="text-xl text-light-text/70 dark:text-dark-text/70 max-w-2xl mx-auto">
              AI-Powered Retinal Fundus Image Analysis
            </p>
            <p className="text-sm text-light-text/50 dark:text-dark-text/50 mt-2">
              Advanced diabetic eye disease detection using deep learning
            </p>
          </motion.div>
        </section>

        <UploadCard
          onImageSelect={setSelectedImage}
          selectedImage={selectedImage}
          onClear={handleReset}
        />

        {selectedImage && !result && (
          <AnalyzeButton
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing}
            isLoading={isAnalyzing}
          />
        )}

        {result && (
          <ResultCard
            prediction={result.prediction}
            confidence={result.confidence}
            onReset={handleReset}
          />
        )}

        <motion.section
          id="about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="backdrop-blur-xl bg-white/30 dark:bg-white/5 rounded-3xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold text-light-text dark:text-dark-text mb-4">
              About Netra
            </h2>
            <p className="text-light-text/70 dark:text-dark-text/70 leading-relaxed mb-4">
              Netra leverages state-of-the-art deep learning models to analyze retinal fundus images and detect signs of diabetic retinopathy. Our AI system is trained on thousands of clinical images to provide accurate, reliable assessments.
            </p>
            <p className="text-light-text/70 dark:text-dark-text/70 leading-relaxed">
              Early detection is crucial in preventing vision loss from diabetic eye disease. Netra aims to make screening more accessible while supporting healthcare professionals in their diagnostic workflow.
            </p>
          </div>
        </motion.section>

        <motion.section
          id="how-it-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="backdrop-blur-xl bg-white/30 dark:bg-white/5 rounded-3xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold text-light-text dark:text-dark-text mb-6">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-light-accent/20 to-light-accent-hover/20 dark:from-dark-accent/20 dark:to-dark-accent/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-light-accent dark:text-dark-accent">1</span>
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">Upload Image</h3>
                <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                  Upload a retinal fundus image in JPG, PNG, or JPEG format
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-light-accent/20 to-light-accent-hover/20 dark:from-dark-accent/20 dark:to-dark-accent/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-light-accent dark:text-dark-accent">2</span>
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">AI Analysis</h3>
                <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                  Our deep learning model processes the image and identifies patterns
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-light-accent/20 to-light-accent-hover/20 dark:from-dark-accent/20 dark:to-dark-accent/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-light-accent dark:text-dark-accent">3</span>
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">Get Results</h3>
                <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                  Receive detailed predictions with confidence scores
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
