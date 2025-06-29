import { useEffect, useRef, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import Swal from "sweetalert2";
import ReactStars from "react-rating-stars-component";
import Select from "react-select";
import "../css/ProductReview.css";
import { getImageUrl } from "./commonFunc";

const ProductReview = ({ reviews, ratingStats }) => {
  const [visibleReviews, setVisibleReviews] = useState(3); // Hiển thị 3 bình luận ban đầu
  const [showMore, setShowMore] = useState(false);
  const [sortOption, setSortOption] = useState("date-desc"); // Tiêu chí sắp xếp mặc định: Ngày mới nhất
  const [sortedReviews, setSortedReviews] = useState(reviews || []); // Danh sách đánh giá đã sắp xếp

  const sortOptions = [
    { value: "date-desc", label: "Ngày thêm (Mới nhất)" },
    { value: "rating-desc", label: "Sao (Cao nhất)" },
    { value: "rating-asc", label: "Sao (Thấp nhất)" },
  ];
  

  // Kiểm tra xem có cần hiển thị nút "Xem thêm" không
  useEffect(() => {
    if (reviews && reviews.length > visibleReviews) {
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  }, [reviews, visibleReviews]);

  // Sắp xếp lại danh sách đánh giá khi tiêu chí thay đổi hoặc reviews thay đổi
  useEffect(() => {
    if (!reviews || reviews.length === 0) {
      setSortedReviews([]);
      return;
    }

    let sorted = [...reviews];
    switch (sortOption) {
      case "date-desc":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "rating-desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-asc":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    setSortedReviews(sorted);
  }, [reviews, sortOption]);

  // Xử lý khi nhấn nút "Xem thêm"
  const handleShowMore = () => {
    setVisibleReviews((prev) => prev + 3); // Tăng thêm 3 bình luận
  };

  // Tính điểm trung bình và tổng số đánh giá từ ratingStats
  const calculateRatingSummary = () => {
    if (!ratingStats) return { average: 0, total: 0 };

    const totalReviews = Object.values(ratingStats).reduce(
      (sum, count) => sum + count,
      0
    );
    const weightedSum = Object.entries(ratingStats).reduce(
      (sum, [star, count]) => sum + Number(star) * count,
      0
    );
    const average = totalReviews ? (weightedSum / totalReviews).toFixed(1) : 0;

    return { average, total: totalReviews };
  };

  const { average, total } = calculateRatingSummary();

  // Tính tỷ lệ phần trăm cho từng mức sao
  const getPercentage = (star) => {
    if (!total) return 0;
    return ((ratingStats[star] || 0) / total) * 100;
  };

  return (
    <div className="user-product-detail-reviews-wrapper">
      {/* Phần tổng quan đánh giá */}
      {total > 0 && (
        <div className="user-product-detail-rating-summary">
          <div className="user-product-detail-rating-overview-container">
            <div className="user-product-detail-rating-overview">
              <div className="user-product-detail-average-rating">
                <span className="user-product-detail-average-score">
                  {average}
                </span>
                <span className="user-product-detail-max-score">/5.0</span>
              </div>
              <div className="user-product-detail-total-reviews">
                ({total} đánh giá)
              </div>
              <div className="user-product-detail-average-stars">
                <ReactStars
                  key={average}
                  count={5} // tổng số sao
                  value={average} // số sao thực tế (ví dụ: 4.5)
                  size={30} // kích thước sao
                  isHalf={true} // cho phép hiển thị nửa sao
                  edit={false} // tắt tương tác (chỉ hiển thị)
                  activeColor="#ffd700" // màu sao vàng
                  classNames="user-product-display-stars"
                />
              </div>
            </div>
            {/* Bộ lọc sắp xếp */}
            <div className="user-product-detail-rating-breakdown">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="user-product-detail-rating-row">
                  <span className="user-product-detail-star-label">{star}</span>
                  <div className="user-product-detail-progress-bar">
                    <div
                      className="user-product-detail-progress-fill"
                      style={{ width: `${getPercentage(star)}%` }}></div>
                  </div>
                  <span className="user-product-detail-star-count">
                    {ratingStats[star] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="user-product-detail-sort-filter">
            <label className="user-product-detail-sort-label">Sắp xếp:</label>
            <div className="user-product-detail-sort-select">
              <Select
                options={sortOptions}
                value={sortOptions.find(
                  (option) => option.value === sortOption
                )}
                onChange={(selected) => setSortOption(selected.value)}
                classNamePrefix="custom-select"
                isSearchable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Phần danh sách bình luận */}
      <div className="user-product-detail-reviews-container">
        {(!sortedReviews || sortedReviews.length === 0) && (
          <p className="user-product-detail-no-reviews">
            Chưa có đánh giá nào.
          </p>
        )}
        {sortedReviews?.length > 0 &&
          sortedReviews
            .slice(0, visibleReviews)
            .map((r, index) => <ReviewItem key={index} review={r} />)}
        {showMore && (
          <button
            className="user-product-detail-show-more"
            onClick={handleShowMore}>
            Xem thêm bình luận
          </button>
        )}
      </div>
    </div>
  );
};

const ReviewItem = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const commentRef = useRef(null);

  const checkOverflow = () => {
    const el = commentRef.current;
    if (!el) return;

    el.classList.remove("expanded");
    el.classList.add("clamped");

    const isOverflowing = el.scrollHeight > el.clientHeight;
    setShowToggle(isOverflowing);

    if (expanded) {
      el.classList.remove("clamped");
      el.classList.add("expanded");
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [review.comment]);

  // Xử lý khi nhấp vào ảnh để hiển thị popup
  const handleImageClick = (image, images) => {
    let currentIndex = images.indexOf(image);

    const updatePopupContent = () => {
      return `
        <div class="user-product-detail-swal-container">
          <button class="user-product-detail-swal-nav user-product-detail-swal-nav-prev" ${
            images.length <= 1 ? "disabled" : ""
          }>
            <svg class="user-product-detail-swal-icon" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <img src="${getImageUrl(
            images[currentIndex]
          )}" alt="Ảnh bình luận" class="user-product-detail-swal-image" />
          <button class="user-product-detail-swal-nav user-product-detail-swal-nav-next" ${
            images.length <= 1 ? "disabled" : ""
          }>
            <svg class="user-product-detail-swal-icon" viewBox="0 0 24 24">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>
        </div>
      `;
    };

    const swalInstance = Swal.fire({
      html: updatePopupContent(),
      showCloseButton: false,
      showConfirmButton: false,
      focusConfirm: false,
      customClass: {
        popup: "user-product-detail-swal-popup",
      },
      width: "auto",
      padding: "0",
      background: "transparent",
      didOpen: () => {
        const container = document.querySelector(
          ".user-product-detail-swal-container"
        );
        const prevButton = document.querySelector(
          ".user-product-detail-swal-nav-prev"
        );
        const nextButton = document.querySelector(
          ".user-product-detail-swal-nav-next"
        );

        const handlePrev = () => {
          currentIndex =
            currentIndex > 0 ? currentIndex - 1 : images.length - 1;
          Swal.update({
            html: updatePopupContent(),
          });
          bindButtons();
        };

        const handleNext = () => {
          currentIndex =
            currentIndex < images.length - 1 ? currentIndex + 1 : 0;
          Swal.update({
            html: updatePopupContent(),
          });
          bindButtons();
        };

        const bindButtons = () => {
          const newPrevButton = document.querySelector(
            ".user-product-detail-swal-nav-prev"
          );
          const newNextButton = document.querySelector(
            ".user-product-detail-swal-nav-next"
          );
          newPrevButton?.addEventListener("click", handlePrev);
          newNextButton?.addEventListener("click", handleNext);
        };

        const handleTouchStart = (e) => {
          const touch = e.touches[0];
          const startX = touch.clientX;

          const handleTouchMove = (e) => {
            const touchMove = e.touches[0];
            const deltaX = touchMove.clientX - startX;
            if (deltaX > 50) {
              handlePrev();
              container.removeEventListener("touchmove", handleTouchMove);
            } else if (deltaX < -50) {
              handleNext();
              container.removeEventListener("touchmove", handleTouchMove);
            }
          };

          const handleTouchEnd = () => {
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
          };

          container.addEventListener("touchmove", handleTouchMove);
          container.addEventListener("touchend", handleTouchEnd);
        };

        if (container) {
          container.addEventListener("touchstart", handleTouchStart);
        }
        bindButtons();

        setTimeout(() => {
          const active = document.activeElement;
          if (
            active === prevButton ||
            active === nextButton ||
            active?.classList?.contains("user-product-detail-swal-nav")
          ) {
            active.blur();
          }
        }, 10);
      
      },
      willClose: () => {
        const container = document.querySelector(
          ".user-product-detail-swal-container"
        );
        const prevButton = document.querySelector(
          ".user-product-detail-swal-nav-prev"
        );
        const nextButton = document.querySelector(
          ".user-product-detail-swal-nav-next"
        );
        if (container) {
          container.removeEventListener("touchstart", () => {});
        }
        if (prevButton) {
          prevButton.removeEventListener("click", () => {});
        }
        if (nextButton) {
          prevButton.removeEventListener("click", () => {});
        }
      },
    });
  };

  return (
    <div className="user-product-detail-review-item">
      <div className="user-product-detail-review-header">
        <div className="user-product-detail-reviewer-name">
          {review?.full_name}
        </div>
        <div className="user-product-detail-review-date">
          {(() => {
            const date = new Date(review?.create_day);
            return `${date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })} - ${date.toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}`;
          })()}
        </div>
      </div>

      <div className="user-product-detail-review-stars">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= review?.star ? (
            <FaStar key={star} className="user-product-detail-star-filled" />
          ) : (
            <FaRegStar key={star} className="user-product-detail-star-empty" />
          )
        )}
      </div>

      {/* Khu vực hiển thị ảnh */}
      {review.images && review.images.trim().length > 0 && (
        <div className="user-product-detail-review-images">
          {review.images.split(",").map((image, index) => (
            <img
              key={index}
              src={getImageUrl(image.trim())}
              alt={`Ảnh bình luận ${index + 1}`}
              className="user-product-detail-review-image"
              onClick={() =>
                handleImageClick(image.trim(), review.images.split(","))
              }
            />
          ))}
        </div>
      )}

      <div
        ref={commentRef}
        className={`user-product-detail-review-comment ${
          expanded ? "expanded" : "clamped"
        }`}>
        {review?.comment}
      </div>

      {showToggle && (
        <button
          className="user-product-detail-review-toggle"
          onClick={() => setExpanded(!expanded)}>
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};








export default ProductReview;
