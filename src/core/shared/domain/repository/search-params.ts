import { ValueObject } from '../value-object';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type SearchParamsProps<Filter = string> = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDirection?: SortDirection | null;
  filter?: Filter | null;
};

export class SearchParams<Filter = string> extends ValueObject {
  readonly page: number;
  readonly perPage: number;
  readonly sort: string | null;
  readonly sortDirection: SortDirection | null = null;
  readonly filter: Filter | null = null;

  constructor(props: SearchParamsProps<Filter> = {}) {
    super();
    this.page = this.sanitizePage(props.page);
    this.perPage = this.sanitizePerPage(props.perPage);
    this.sort = this.sanitizeSort(props.sort);
    this.sortDirection = this.sanitizeSortDirection(props.sortDirection);
    this.filter = this.sanitizeFilter(props.filter);
  }

  private sanitizePage(value: number | undefined): number {
    if (!value || value <= 0 || parseInt(value as any) !== value) {
      return 1;
    }

    return value;
  }

  private sanitizePerPage(value: number | undefined): number {
    if (!value || value <= 0 || parseInt(value as any) !== value) {
      return 15;
    }

    return value;
  }

  private sanitizeSort(value: string | undefined | null): string | null {
    if (!value) {
      return null;
    }

    return value;
  }

  private sanitizeSortDirection(
    value: SortDirection | undefined | null,
  ): SortDirection {
    if (!this.sort) {
      return null;
    }

    const dir = `${value}`.toLowerCase();
    return dir === SortDirection.ASC ? SortDirection.ASC : SortDirection.DESC;
  }

  private sanitizeFilter(value: Filter | undefined | null) {
    if (!value) {
      return null;
    }

    return value;
  }
}
