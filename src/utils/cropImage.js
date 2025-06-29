import { createImage } from "./createImage";

export const getCroppedImg = async (imageSrc, crop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const size = Math.max(crop.width, crop.height);
  canvas.width = size;
  canvas.height = size;

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob); // ⚠️ Trả về Blob chứ không phải Object URL
    }, "image/jpeg");
  });
};
