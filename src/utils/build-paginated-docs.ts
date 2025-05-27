import { getSchemaPath } from '@nestjs/swagger';

export function buildPaginatedDocs(
  // eslint-disable-next-line @typescript-eslint/ban-types
  model: string | Function,
  path: string = '',
) {
  return {
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(model),
          },
        },
        meta: {
          type: 'object',
          properties: {
            itemsPerPage: {
              type: 'number',
              description: 'Number of items per page',
              example: 10,
              readOnly: true,
            },
            totalItems: {
              type: 'number',
              description: 'Total number of items',
              example: 100,
              readOnly: true,
            },
            currentPage: {
              type: 'number',
              description: 'Current page number',
              example: 1,
              readOnly: true,
            },
            totalPages: {
              type: 'number',
              description: 'Total number of pages',
              example: 10,
              readOnly: true,
            },
            sortBy: {
              type: 'array',
              description: 'Sorting criteria',
              example: [['id', 'DESC']],
              readOnly: true,
            },
            search: {
              type: 'string',
              description: 'Search query',
              example: 'Jane',
              readOnly: true,
            },
            filter: {
              type: 'object',
              description: 'Filter criteria',
              example: { tags: ['VIP'] },
              readOnly: true,
            },
          },
        },
        links: {
          properties: {
            first: {
              type: 'string',
              description: 'Link to the first page',
              example: `/api/v1/${path}?page=1`,
            },
            previous: {
              type: 'string',
              description: 'Link to the previous page',
              example: `/api/v1/${path}?page=1`,
            },
            current: {
              type: 'string',
              description: 'Link to the current page',
              example: `/api/v1/${path}?page=1`,
            },
            next: {
              type: 'string',
              description: 'Link to the next page',
              example: `/api/v1/${path}?page=2`,
            },
            last: {
              type: 'string',
              description: 'Link to the last page',
              example: `/api/v1/${path}?page=10`,
            },
          },
        },
      },
    },
  };
}
