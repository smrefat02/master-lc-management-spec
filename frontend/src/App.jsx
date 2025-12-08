import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ContractsOverview from "./pages/ContractsOverview";
import ContractDetailPage from "./pages/ContractDetailPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ContractsOverview />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
