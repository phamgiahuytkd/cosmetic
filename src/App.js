import "./App.css";
import MenuAdmin from "./component/admin/MenuAdmin";
import { jwtDecode } from "jwt-decode";
import { Menu } from "./component/Menu";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login2 from "./authenticate/Login2";
import Signup from "./authenticate/Signup";
import { CartProvider } from "./component/CartContext";
import { UserProvider } from "./component/UserContext";
import { FavoriteProvider } from "./component/FavoriteContext";
import { BrandCategoryProvider } from "./component/BrandCategoryContext";
import { AddAndBuyNowModalProvider } from "./component/AddAndBuyNowModalContext";
import ResetPassword from "./page/ResetPassword";


function AppWrapper() {
  const location = useLocation();

  // Nếu đang ở trang login thì hiển thị Login component luôn
  if (location.pathname === "/auth/login") {
    return <Login2 />;
  }
  if (location.pathname === "/auth/signup") {
    return <Signup />;
  }
  if (location.pathname === "/auth/reset-password") {
    return <ResetPassword />;
  }

  const token = localStorage.getItem("token");
  let role = null;

  try {
    if (token && token !== undefined) {
      const decodedToken = jwtDecode(token);
      role = decodedToken.scope;
    }
  } catch (e) {
    console.error("Invalid token");
    localStorage.removeItem("token");
  }

  return (
    <div className="bodyContainer">
      {role === "ADMIN" ? (
        <MenuAdmin />
      ) : (
        <BrandCategoryProvider>
          <UserProvider>
            <CartProvider>
              <FavoriteProvider>
                <AddAndBuyNowModalProvider>
                  <Menu />
                </AddAndBuyNowModalProvider>
              </FavoriteProvider>
            </CartProvider>
          </UserProvider>
        </BrandCategoryProvider>
      )}
    </div>
  );
}

function App() {
  return (
   
      <Router>
        <Routes>
          <Route path="/*" element={<AppWrapper />} />
        </Routes>
      </Router>

  );
}

export default App;
