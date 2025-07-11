import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import VibeSelector from './pages/VibeSelector';
import ThemeSelector from './pages/ThemeSelector';
import Recommendations from './pages/Recommendations';
import MovieTest from './components/MovieTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="questionnaire" element={<Questionnaire />} />
          <Route path="vibe-selector" element={<VibeSelector />} />
          <Route path="theme-selector" element={<ThemeSelector />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="test" element={<MovieTest />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
