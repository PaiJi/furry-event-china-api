const GLOBAL_MANUAL_CDN_IMAGE_URL = "images.furryeventchina.com";

function imageURL(originURL: string) {
  const withoutDefaultHostSrc = originURL
    .replace("https://cdn.furryeventchina.com/", "")
    .replace("https://images.furryeventchina.com/", "")
    .replace("https://images.furrycons.cn/", "")
    .trim();
  return `https://${GLOBAL_MANUAL_CDN_IMAGE_URL}/${withoutDefaultHostSrc}`;
}

export default imageURL;
