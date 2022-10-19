export const LINKEDIN_URL = "https://www.linkedin.com/sharing/share-offsite/";
export const getLinkedInHref = ({ url }: { url: string }) => {
  const shareUrl = new URL(LINKEDIN_URL);
  const search = new URLSearchParams({
    url,
  }).toString();

  shareUrl.search = search;

  return shareUrl.href;
};
