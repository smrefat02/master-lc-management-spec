import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/layout/Layout";
import ContractsOverview from "./pages/ContractsOverview";
import ContractDetailPage from "./pages/ContractDetailPage";
import OrdersOverview from "./pages/OrdersOverview";
import CreateOrder from "./pages/CreateOrder";
import OrderDetailPage from "./pages/OrderDetailPage";
import ShipmentsOverview from "./pages/ShipmentsOverview";
import ShipmentDetailPage from "./pages/ShipmentDetailPage";
import MasterLCList from "./pages/MasterLCList";
import CreateMasterLC from "./pages/CreateMasterLC";
import MasterLCDetail from "./pages/MasterLCDetail";
import B2BLCList from "./pages/B2BLCList";
import CreateB2BLC from "./pages/CreateB2BLC";
import B2BLCDetail from "./pages/B2BLCDetail";
import Buyers from "./pages/Buyers";
import SuppliersList from "./pages/suppliers/SuppliersList";

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
          <Route path="/master-lc" element={<MasterLCList />} />
          <Route path="/master-lc/create" element={<CreateMasterLC />} />
          <Route path="/master-lc/:id" element={<MasterLCDetail />} />
          <Route path="/master-lc/:id/edit" element={<CreateMasterLC />} />
          <Route path="/b2b-lc" element={<B2BLCList />} />
          <Route path="/b2b-lc/create" element={<CreateB2BLC />} />
          <Route path="/b2b-lc/:id" element={<B2BLCDetail />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/suppliers" element={<SuppliersList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
