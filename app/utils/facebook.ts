export const FACEBOOK_URL = "https://www.facebook.com/sharer/sharer.php";
export const getFacebookHref = ({ url }: { url: string }) => {
  const shareUrl = new URL(FACEBOOK_URL);
  const search = new URLSearchParams({
    u: url,
  }).toString();

  shareUrl.search = search;

  return shareUrl.href;
};
