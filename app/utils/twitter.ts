export const TWITTER_INTENT_URL = "https://twitter.com/intent/tweet";
const TWITTER_HANDLE = "inhoots";

export const getTwitterHref = ({
  url,
  title,
  tags,
}: {
  url: string;
  title: string;
  tags?: string[];
}) => {
  const shareUrl = new URL(TWITTER_INTENT_URL);
  const search = new URLSearchParams({
    url,
    text: title,
    hashtags: tags?.length ? tags.join(",") : "",
    via: TWITTER_HANDLE,
  }).toString();

  shareUrl.search = search;

  return shareUrl.href;
};
