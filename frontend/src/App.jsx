import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContractsOverview from "./pages/ContractsOverview";
import ContractDetailPage from "./pages/ContractDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ContractsOverview />} />
        <Route path="/contracts/:id" element={<ContractDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
