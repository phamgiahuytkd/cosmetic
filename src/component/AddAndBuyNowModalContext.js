// context/BuyNowModalContext.js
import React, { createContext, useContext, useState } from "react";
import BuyNow from "../page/BuyNow";

const AddAndBuyNowModalContext = createContext();

export const AddAndBuyNowModalProvider = ({ children }) => {
  const [openAddAndBuyNowModal, setOpenAddAndBuyNowModal] = useState({
    open: false,
    isBuyNow: false,
  });
  const [addAndBuyNowProduct, setAddAndBuyNowProduct] = useState({ product: {}, product_variant: []});


  return (
    <AddAndBuyNowModalContext.Provider
      value={{
        openAddAndBuyNowModal,
        setOpenAddAndBuyNowModal,
        addAndBuyNowProduct,
        setAddAndBuyNowProduct
      }}>
      {children}
    </AddAndBuyNowModalContext.Provider>
  );
};

export const useAddAndBuyNowModal = () => useContext(AddAndBuyNowModalContext);
