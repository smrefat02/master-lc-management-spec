import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ContractsOverview from "./pages/ContractsOverview";
import ContractDetailPage from "./pages/ContractDetailPage";
import OrdersOverview from "./pages/OrdersOverview";
import CreateOrder from "./pages/CreateOrder";
import OrderDetailPage from "./pages/OrderDetailPage";
import ShipmentsOverview from "./pages/ShipmentsOverview";
import ShipmentDetailPage from "./pages/ShipmentDetailPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ContractsOverview />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/orders" element={<OrdersOverview />} />
          <Route path="/orders/create" element={<CreateOrder />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/shipments" element={<ShipmentsOverview />} />
          <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
          <Route path="/shipments/:id/edit" element={<ShipmentDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
