import {
  SearchParams,
  SearchParamsProps,
  SortDirection,
} from '../search-params';

describe('Search Params Value Object', () => {
  describe('constructor', () => {
    it('should build search params with default values', () => {
      const searchParams = new SearchParams();

      expect(searchParams.page).toBe(1);
      expect(searchParams.perPage).toBe(15);
      expect(searchParams.sort).toBe(null);
      expect(searchParams.sortDirection).toBe(null);
      expect(searchParams.filter).toBe(null);
    });

    describe('should sanitize page field', () => {
      [
        { props: { page: undefined } as SearchParamsProps, expected: 1 },
        { props: { page: {} } as SearchParamsProps, expected: 1 },
        { props: { page: 0 } as SearchParamsProps, expected: 1 },
        { props: { page: -1 } as SearchParamsProps, expected: 1 },
        { props: { page: 5.5 } as SearchParamsProps, expected: 1 },
        { props: { page: 1 } as SearchParamsProps, expected: 1 },
        { props: { page: 2 } as SearchParamsProps, expected: 2 },
      ].forEach((test) => {
        it(`when page is ${JSON.stringify(test.props.page)}`, () => {
          const searchParams = new SearchParams(test.props);
          expect(searchParams.page).toBe(test.expected);
        });
      });
    });

    describe('should sanitize perPage field', () => {
      [
        { props: { perPage: undefined } as SearchParamsProps, expected: 15 },
        { props: { perPage: {} } as SearchParamsProps, expected: 15 },
        { props: { perPage: 0 } as SearchParamsProps, expected: 15 },
        { props: { perPage: -1 } as SearchParamsProps, expected: 15 },
        { props: { perPage: 5.5 } as SearchParamsProps, expected: 15 },
        { props: { perPage: 1 } as SearchParamsProps, expected: 1 },
        { props: { perPage: 2 } as SearchParamsProps, expected: 2 },
      ].forEach((test) => {
        it(`when perPage is ${JSON.stringify(test.props.perPage)}`, () => {
          const searchParams = new SearchParams(test.props);
          expect(searchParams.perPage).toBe(test.expected);
        });
      });
    });

    describe('should sanitize sort field', () => {
      [
        { props: { sort: undefined } as SearchParamsProps, expected: null },
        { props: { sort: null } as SearchParamsProps, expected: null },
        { props: { sort: '' } as SearchParamsProps, expected: null },
        { props: { sort: 'field' } as SearchParamsProps, expected: 'field' },
      ].forEach((test) => {
        it(`when sort is ${JSON.stringify(test.props.sort)}`, () => {
          const searchParams = new SearchParams(test.props);
          expect(searchParams.sort).toBe(test.expected);
        });
      });
    });

    describe('should sanitize sortDirection field', () => {
      it(`when sort is not given`, () => {
        const props = {
          sort: null,
          sortDirection: SortDirection.ASC,
        } as SearchParamsProps;

        const searchParams = new SearchParams(props);

        expect(searchParams.sortDirection).toBe(null);
      });

      [
        {
          props: {
            sort: 'field',
            sortDirection: undefined,
          } as SearchParamsProps,
          expected: null,
        },
        {
          props: { sort: 'field', sortDirection: null } as SearchParamsProps,
          expected: null,
        },
        {
          props: {
            sort: 'field',
            sortDirection: SortDirection.ASC,
          } as SearchParamsProps,
          expected: SortDirection.ASC,
        },
        {
          props: {
            sort: 'field',
            sortDirection: SortDirection.DESC,
          } as SearchParamsProps,
          expected: SortDirection.DESC,
        },
      ].forEach((test) => {
        it(`when sortDirection is ${JSON.stringify(test.props.sortDirection)}`, () => {
          const searchParams = new SearchParams(test.props);
          expect(searchParams.sortDirection).toBe(test.expected);
        });
      });
    });

    describe('should sanitize filter field', () => {
      [
        { props: { filter: undefined } as SearchParamsProps, expected: null },
        { props: { filter: null } as SearchParamsProps, expected: null },
        { props: { filter: '' } as SearchParamsProps, expected: null },
        { props: { filter: 'field' } as SearchParamsProps, expected: 'field' },
      ].forEach((test) => {
        it(`when filter is ${JSON.stringify(test.props.filter)}`, () => {
          const searchParams = new SearchParams(test.props);
          expect(searchParams.filter).toBe(test.expected);
        });
      });
    });
  });
});
