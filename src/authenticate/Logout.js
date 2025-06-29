import api from "../service/api";

function Logout(){
    const token = localStorage.getItem("token");
    api.post("/auth/logout", { token })
          .then(response => {
            localStorage.setItem("token", response.data.result.token); // Lưu token vào localStorage  
            alert("Đã đăng xuất");
            window.location.href = "/";
          })
          .catch(error => {
            alert(error.response.data.message);
          });
    localStorage.removeItem("token"); // Xóa token kh��i localStorage
    window.location.href = "/"; // Trở về trang chủ
}


export default Logout;