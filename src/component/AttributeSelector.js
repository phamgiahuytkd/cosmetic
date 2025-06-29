import React from "react";
import "../css/AddAndBuyNowModel.css"; // nếu cần dùng style chung

const AttributeSelector = ({
  groupedAttributes,
  selectedAttributes,
  handleSelect,
}) => {
  return ( 
    <>
      {Object.entries(groupedAttributes).map(([attributeId, valuesSet]) => (
        <div
          key={attributeId}
          className="user-product-add-and-buy-now-attribute-group">
          <h4 className="user-product-add-and-buy-now-attribute-title">
            {attributeId}
          </h4>
          <div>
            {[...valuesSet].map((valueId) => (
              <label
                key={valueId}
                className={`user-product-add-and-buy-now-attribute-label ${
                  selectedAttributes[attributeId] === valueId ? "selected" : ""
                }`}>
                <input
                  type="radio"
                  name={attributeId}
                  value={valueId}
                  checked={selectedAttributes[attributeId] === valueId}
                  onChange={() => handleSelect(attributeId, valueId)}
                  className="user-product-add-and-buy-now-attribute-input"
                />
                {valueId}
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default AttributeSelector;
