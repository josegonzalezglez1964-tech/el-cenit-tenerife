import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TestamentoWizard from "./pages/TestamentoWizard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/testamento" element={<TestamentoWizard />} />
    </Routes>
  );
}

export default App;
