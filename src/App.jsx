import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TestamentoWizard from "./pages/TestamentoWizard";
import Boveda from "./pages/Boveda";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/testamento" element={<TestamentoWizard />} />
      <Route path="/boveda" element={<Boveda />} />
    </Routes>
  );
}

export default App;
