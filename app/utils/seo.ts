export function getSocialMetas({
  url,
  title = 'Hoots Mentoring',
  description = 'Find a mentor who gives a hoot!',
  image = 'https://global-uploads.webflow.com/627c812e977439050e1a2eb1/62908d9ce467d88a183cbb4e_Hero_new.jpg',
  keywords = '',
  ogTitle = '',
}: {
  image?: string;
  url: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
}) {
  return {
    title,
    description,
    keywords,
    image,
    'og:url': url,
    'og:title': ogTitle ?? title,
    'og:description': description,
    'og:image': image,
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:creator': '@inhoots',
    'twitter:site': '@inhoots',
    'twitter:title': ogTitle ?? title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:alt': ogTitle ?? title,
  };
}

export default getSocialMetas;
