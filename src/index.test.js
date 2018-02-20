import cacheRequestsMiddleware, {
  cacheRequestDictionnary,
  generateCacheKey,
} from '.';

const requestFundsheetStart = {
  type: 'actionTypes.REQUEST.FUNDSHEET.START',
  payload: { fundID: 1000 },
  meta: {
    cacheTime: 2000,
  },
};

const cacheKeyName = generateCacheKey(
  requestFundsheetStart.type,
  requestFundsheetStart.payload
);

const requestFundsheetStartWithoutCache = {
  type: 'actionTypes.REQUEST.FUNDSHEET.START',
  payload: { fundID: 1000 },
};

describe('cacheRequestMiddleware', () => {
  it('should NOT generate cache key in dictionnary when action has meta cachetime', () => {
    const next = jest.fn();
    cacheRequestsMiddleware()(next)(requestFundsheetStartWithoutCache);
    expect(next).toBeCalledWith(requestFundsheetStartWithoutCache);
  });

  it('should generate cache key in dictionnary when action has meta cachetime', () => {
    const next = jest.fn();
    cacheRequestsMiddleware()(next)(requestFundsheetStart);
    expect(next).toBeCalledWith(requestFundsheetStart);
    expect(cacheRequestDictionnary[cacheKeyName]).toBeDefined();
  });

  it('should cancel next action when action request is in cache', () => {
    const next = jest.fn();
    cacheRequestsMiddleware()(next)(requestFundsheetStart);
    expect(next).not.toBeCalled();
  });

  it('should regenerate cache and trigger next action when cache is obsolete', done => {
    const next = jest.fn();
    setTimeout(() => {
      cacheRequestsMiddleware()(next)(requestFundsheetStart);
      expect(next).toBeCalledWith(requestFundsheetStart);
      expect(cacheRequestDictionnary[cacheKeyName]).toBeDefined();
      done();
    }, 2000);
  });
});
