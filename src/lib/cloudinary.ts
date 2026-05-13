// ─── Cloudinary 이미지 업로드 유틸 ───────────────────────────────────────────
// Firebase Storage 대신 Cloudinary(무료)를 사용합니다.

const CLOUDINARY_CLOUD_NAME = "dkdu15cfn";
const CLOUDINARY_UPLOAD_PRESET = "lost_and_found";

/**
 * 파일을 Cloudinary에 업로드하고 공개 URL을 반환합니다.
 * @param file 업로드할 이미지 파일
 * @returns 업로드된 이미지의 공개 URL
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패: ${response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url as string;
}
