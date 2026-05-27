/**
 * 이미지 파일을 Canvas를 이용해 압축합니다.
 * @param file 원본 이미지 파일
 * @param maxWidth 최대 너비 (기본 1200px)
 * @param quality WebP 품질 0~1 (기본 0.85)
 * @returns 압축된 File 객체
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const ratio = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // canvas 미지원 시 원본 반환
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: "image/webp" }
          );
          resolve(compressed);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지 로드 실패"));
    };

    img.src = objectUrl;
  });
}
