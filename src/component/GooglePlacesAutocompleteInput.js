import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";
import "../css/InputComponent.css";

const GooglePlacesAutocompleteInput = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  errors = {},
  disabled = false,
}) => {
  const autoCompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autoCompleteRef.current.getPlace();
    if (place && place.formatted_address) {
      onChange(name, place.formatted_address);
    }
  };

  return (
    <div
      className={`user-checkout-input-group ${
        disabled ? "user-checkout-input-group--disabled" : ""
      }`}>
      <div
        className={`user-checkout-input-wrapper ${
          value ? "user-checkout-input-wrapper--filled" : ""
        }`}>
        <label className="user-checkout-input-label" htmlFor={name}>
          {label}
        </label>
        <Autocomplete
          onLoad={(autocomplete) => {
            autoCompleteRef.current = autocomplete;
          }}
          onPlaceChanged={handlePlaceChanged}>
          <input
            type="text"
            id={name}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(name, e.target.value)}
            disabled={disabled}
            className="user-checkout-input-field-address-detail"
          />
        </Autocomplete>
        {errors[name] && (
          <p className="user-checkout-input-error">{errors[name]}</p>
        )}
      </div>
    </div>
  );
};

export default GooglePlacesAutocompleteInput;
