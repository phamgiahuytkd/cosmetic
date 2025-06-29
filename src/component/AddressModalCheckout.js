import { Box, Button, FormControlLabel, Modal, Radio, RadioGroup, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const AddressModalCheckout = ({
  open,
  onClose,
  onSave,
  addresses,
  defaultAddressId,
  navigate,
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddressId ? defaultAddressId.toString() : ""
  );

  useEffect(() => {
    console.log("AddressModal: defaultAddressId:", defaultAddressId);
    setSelectedAddressId(defaultAddressId ? defaultAddressId.toString() : "");
  }, [defaultAddressId]);

  const handleSave = () => {
    const selectedAddress = addresses.find(
      (addr) => addr.id.toString() === selectedAddressId
    );
    console.log("AddressModal: selectedAddressId:", selectedAddressId);
    console.log("AddressModal: Selected address:", selectedAddress);
    if (selectedAddress) {
      onSave(selectedAddress);
    } else {
      console.error(
        "AddressModal: No address found for selectedAddressId:",
        selectedAddressId
      );
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%", // Cho phép mở rộng tối đa theo giới hạn min/max
          minWidth: 300,
          maxWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
        <Typography variant="h6" gutterBottom>
          Chọn địa chỉ giao hàng
        </Typography>
        <RadioGroup
          value={selectedAddressId}
          onChange={(e) => {
            setSelectedAddressId(e.target.value);
            console.log("AddressModal: Radio changed to:", e.target.value);
          }}>
          {addresses.map((addr) => (
            <FormControlLabel
              key={addr.id}
              value={addr.id.toString()}
              control={<Radio />}
              label={
                <div>
                  <strong>{addr.name || "Không có tên"}</strong>
                  <br />
                  <span>{addr.phone || "Không có SĐT"}</span>
                  <br />
                  <span>{`${addr.address_detail || "Không có chi tiết"}, ${
                    addr.address || "Không có địa chỉ"
                  }`}</span>
                </div>
              }
              sx={{ mb: 2 }}
            />
          ))}
        </RadioGroup>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            gap: 1,
          }}>
          <Button
            variant="text"
            onClick={() => navigate("/dashboard/info")}
            sx={{ color: "primary.main" }}>
            Thêm địa chỉ mới
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={onClose}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!selectedAddressId}>
              Chọn
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};


export default AddressModalCheckout;