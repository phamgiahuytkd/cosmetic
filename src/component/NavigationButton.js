import "../css/NavigationButton.css";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";

const NavigationButton = ({ prevRef, nextRef }) => {
  return (
    <div className="user-navigation-button">
      <button ref={prevRef}>
        <GrFormPreviousLink />
      </button>
      <button ref={nextRef}>
        <GrFormNextLink />
      </button>
    </div>
  );
};

export default NavigationButton;
