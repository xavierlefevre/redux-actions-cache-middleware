# Redux Actions Cache Middleware

## What is it?

You want to easily cache a Redux action in order not to trigger a request again, or change the state for a specific period of time? You found the right library.

## Principle

> 🤔  **The idea of the cacheRequestMiddleware** is to cache any redux action. We mainly use it for caching asynchronous actions, actions used for fetching data with sagas, to prevent useless refetching for some time.

If you provide a meta parameter with a cacheTime key to your action, the cacheRequestMiddleware will store a cacheKey associated to this request and the time of the request in an object called `cacheRequestDictionnary`.

When you start the same request in a smaller period of time than the cacheTime you have provided, the middleware will catch the request, detect that it has a cacheTime meta and that it is already in the `cacheRequestDictionnary`. It will stop the action from going in the saga and the reducer, thus improving the performance of the application!

When you restart the request in a larger period of time than the cacheTime you have provided, the middleware will update the last date of the request start in the `cacheRequestDictionnary` and let the saga begin.

However if the request fails, the cache is removed to let the next action pass directly.

## How to use it as a developer

- Make sure the middleware was added to your middlewares: `middlewares = [cacheRequestsMiddleware,...]`
- If you want to use the cache system, you simply have to add a meta object to your asynchronous action with a cacheTime key in milliseconds, for instance 1000ms:
```javascript
const actionCreators = {
  requestDataStart(param) => ({
    type: actionTypes.REQUEST.DATA.START,
    payload: { param },
    meta: { cacheTime: 1000 },
  }),
};
```

## The particular case of failed requests

The name of the request is used to see which cache entry we will have to delete in the `cacheRequestDictionnary`.

When a request has failed, we do not want it to be cached in our `cacheRequestDictionnary`:
  - The request starts
  - If it respects the condition given above, we cache it in the `cacheRequestDictionnary`.
  - When we detect a failing request (named with a "failed", like requestDataFailed), we check in the cacheRequestDictionnary if we have the same request type (fundsheetStart, rankingStart, etc.) in the dictionnary.
    - if we do not, we do nothing
    - if we do, we delete the last element of cacheRequestDictionnary
