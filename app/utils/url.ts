function getDomainUrl(request: Request) {
  const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host');
  if (!host) {
    throw new Error('Could not determine domain URL.');
  }
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

function removeTrailingSlash(s: string) {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

function getDisplayUrl(requestInfo?: { origin: string; path: string }) {
  return getUrl(requestInfo).replace(/^https?:\/\//, '');
}

function getUrl(requestInfo?: { origin: string; path: string }) {
  return removeTrailingSlash(
    `${requestInfo?.origin ?? 'https://app.inhoots.com'}${
      requestInfo?.path ?? ''
    }`,
  );
}

export {
  removeTrailingSlash, getDisplayUrl, getUrl, getDomainUrl,
};
