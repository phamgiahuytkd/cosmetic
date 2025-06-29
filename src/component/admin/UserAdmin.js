import React, { useEffect, useState } from "react";
import "../../css/admin/UserAdmin.css";
import api from "../../service/api";

function UserAdmin() {

  const [users, setUsers] = useState([]);
    
    useEffect(() => {
        api.get('/user').then(response => { 
          setUsers(response.data.result);
        })
        .catch(error => {
            console.error(error.response.data.message);
        });
    }, []);


  return (
    <div className="user-admin-container">
      <h1 className="user-admin-title">Người dùng</h1>
      <table className="user-admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Tên người dùng</th>
            <th>SĐT</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.email || "Chưa cập nhật"}</td>
              <td>{user.full_name || "Chưa cập nhật"}</td>
              <td>{user.phone || "Chưa cập nhật"}</td>
              <td>{user.date_of_birth || "Chưa cập nhật"}</td>
              <td>{user.default_shipping_address || "Chưa cập nhật"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserAdmin;
