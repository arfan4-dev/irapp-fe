export const getImageUrl = (url = "") => {
  // Remove trailing slashes and "/api/v1" from base URL
  let baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/api(\/v1)?\/?$/, "");

  // Remove "public/temp/" or "public/" from the beginning of the path
  let cleanedPath = url
    .replace(/^\/?public\/temp\/?/, "")
    .replace(/^\/?public\//, "");

  return url ? `${baseUrl}/temp/${cleanedPath}` : "";
};
