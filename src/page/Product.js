import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Product.css";
import api from "../service/api";
import SearchForm from "../component/SearchForm"; // 🟢 Thêm dòng này
import { useCart } from "../component/CartContext";
import { getImageUrl } from "../component/commonFunc";
import { useBrandCategory } from "../component/BrandCategoryContext";
import ProductCard from "../component/ProductCard";

const Product = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const closeForm = () => setIsFormVisible(false);
  const [searchTitle, setSearchTitle] = useState(false); // ✅ ĐÚNG
  const { brands, categories } = useBrandCategory();

  useEffect(() => {
    // 🟢 Kiểm tra nếu có state truyền từ FloatingToolbar
    if (location.state?.showSearchForm) {
      setIsFormVisible(true);
      // Xóa state sau khi sử dụng để tránh hiển thị lại khi reload
      navigate(location.pathname, { replace: true });
    }

    // 🟢 Lắng nghe sự kiện từ FloatingToolbar
    const handleToggleSearch = () => {
      setIsFormVisible((prev) => !prev);
    };
    window.addEventListener("toggleSearchForm", handleToggleSearch);

    return () => {
      window.removeEventListener("toggleSearchForm", handleToggleSearch);
    };
  }, [location, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const isReset = searchParams.get("reset") === "true";
    const searchQuery = searchParams.get("search");

    if (searchQuery) {
      api
        .post("/product/search", {
          name: searchQuery,
          min_price: null,
          max_price: null,
          brand_id: null,
          category_id: null,
        })
        .then((res) => {
          setProducts(res.data.result);
          setSearchTitle(true);
        })
        .catch((err) => {
          console.error(
            err.response?.data?.message || "Lỗi tìm sản phẩm theo lọc"
          );
        });
      return;
    }

    if (isReset) {
      // ⚠️ Nếu đang yêu cầu reset
      api
        .get("/product")
        .then((res) => {
          setProducts(res.data.result);
          setBrandName("");
          setCategoryName("");
          setSearchTitle(false);
          // ⚠️ Xóa reset=true khỏi URL sau khi đã xử lý
          searchParams.delete("reset");
          navigate(`${location.pathname}?${searchParams.toString()}`, {
            replace: true,
          });
        })
        .catch((err) => {
          console.error(
            err.response?.data?.message || "Lỗi lấy danh sách sản phẩm"
          );
        });
      return; // ⛔ Dừng tại đây, không chạy tiếp
    }

    // ✅ Nếu đang lọc theo category/brand
    if (category || brand) {
      api
        .post("/product/filter", {
          name: null,
          min_price: null,
          max_price: null,
          brand_id: brand || null,
          category_id: category || null,
        })
        .then((res) => {
          setProducts(res.data.result);
          setSearchTitle(false);
          setBrandName(brand);
          setCategoryName(category);
        })
        .catch((err) => {
          console.error(
            err.response?.data?.message || "Lỗi tìm sản phẩm theo lọc"
          );
        });
    } else {
      // ✅ Trường hợp không có gì trong query
      api
        .get("/product")
        .then((res) => {
          setProducts(res.data.result);
          setBrandName("");
          setCategoryName("");
        })
        .catch((err) => {
          console.error(
            err.response?.data?.message || "Lỗi lấy danh sách sản phẩm"
          );
        });
    }
  }, [location.search, navigate]);

  const handleSearch = (searchData) => {
    const { name, brand, category, minPrice, maxPrice } = searchData;
    // Đảm bảo các tham số không phải là undefined
    api
      .post("/product/filter", {
        name: name,
        min_price: minPrice,
        max_price: maxPrice,
        brand_id: brand,
        category_id: category,
      })
      .then((response) => {
        setProducts(response.data.result);
        setSearchTitle(true);
      })
      .catch((error) => {
        console.error(
          error.response?.data?.message || "Error fetching products"
        );
      });
  };

  const getBrandNameById = (id) => {
    const brand = brands.find((b) => b.id === id);
    return brand ? brand.name : "";
  };

  const getCategoryNameById = (id) => {
    const category = categories.find((c) => c.id === id);
    return category ? category.name : "";
  };

  return (
    <div className="user-product-container">
      {/* 🟢 Thêm SearchForm ở đầu trang */}
      <SearchForm
        isVisible={isFormVisible}
        onClose={() => closeForm(false)}
        onSubmit={handleSearch}
      />

      <div className="user-product-poster">
        <img
          src={
            categoryName
              ? getImageUrl(
                  categories.find((c) => c.id === categoryName)?.image
                ) || "/image/1 (2).png"
              : brandName
              ? getImageUrl(brands.find((c) => c.id === brandName)?.image)
              : "/image/1 (2).png"
          }
          alt="Banner"
        />
      </div>

      <h2 className="user-product-title">
        {searchTitle
          ? "KẾT QUẢ TÌM KIẾM"
          : categoryName
          ? getCategoryNameById(categoryName).toUpperCase()
          : brandName
          ? getBrandNameById(brandName).toUpperCase()
          : "TẤT CẢ SẢN PHẨM"}
      </h2>

      <div className="user-product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Product;
