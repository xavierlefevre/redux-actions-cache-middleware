// @flow
import base64 from 'base-64';

/* eslint-disable import/no-mutable-exports */
export let cacheRequestDictionnary: { [string]: number } = {};

const isCacheObsolete = (cacheKey: string, metaCacheTime: number): boolean =>
  new Date().getTime() - cacheRequestDictionnary[cacheKey] >= metaCacheTime;

export const generateCacheKey = (
  actionType: string,
  actionPayload: Object
): string => `${actionType}-${base64.encode(JSON.stringify(actionPayload))}`;

const cacheRequestsMiddleware = () => (next: any) => (action: any) => {
  if (action.type.includes('LOGOUT')) {
    cacheRequestDictionnary = {};
  }
  if (action.type.includes('FAILED')) {
    const matchingCachedRequests = Object.keys(cacheRequestDictionnary).filter(
      actionType => actionType.includes(action.type.replace('.FAILED', ''))
    );
    if (matchingCachedRequests.length === 0) {
      next(action);
      return;
    }

    delete cacheRequestDictionnary[
      matchingCachedRequests[matchingCachedRequests.length - 1]
    ];
  }

  // trigger next action if request is not cached
  if (!action.meta || !('cacheTime' in action.meta)) {
    next(action);
    return;
  }

  const cacheKey = generateCacheKey(action.type, action.payload);

  if (
    !(cacheKey in cacheRequestDictionnary) ||
    isCacheObsolete(cacheKey, action.meta.cacheTime)
  ) {
    // generate new cache key if request has never been called or is outdated
    cacheRequestDictionnary[cacheKey] = new Date().getTime();
    next(action);
  }
};

export default cacheRequestsMiddleware;
