import { lastValueFrom, of } from 'rxjs';
import { ResponseDataWrapperInterceptor } from '../response-data-wrapper.interceptor';

describe('Respose Data Wrapper Interceptor', () => {
  let interceptor: ResponseDataWrapperInterceptor;

  beforeEach(() => {
    interceptor = new ResponseDataWrapperInterceptor();
  });

  it('should wrap with data key', async () => {
    const obs = interceptor.intercept({} as any, {
      handle: () => of({ name: 'test' }),
    });

    const result = await lastValueFrom(obs);
    expect(result).toEqual({ data: { name: 'test' } });
  });

  it('should not wrap when meta key is present', async () => {
    const data = { data: { name: 'test' }, meta: { total: 1 } };
    const obs = interceptor.intercept({} as any, {
      handle: () => of(data),
    });

    const result = await lastValueFrom(obs);
    expect(result).toEqual(data);
  });
});
