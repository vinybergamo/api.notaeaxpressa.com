import { Body, Controller, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Project } from './entities/project.entity';
import { buildPaginatedDocs } from '@/utils/build-paginated-docs';
import { Me } from '@/helpers/decorators/me.decorator';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Endpoint({
    method: 'GET',
    documentation: {
      extraModels: [Project],
      summary: 'List all projects',
      query: [
        {
          name: 'relations',
          description:
            'Semicolon-Separated list of relations to include in the response',
          required: false,
          schema: {
            type: 'string',
            example: 'customer;user',
          },
        },
      ],
      responses: {
        200: {
          description: 'List of projects',
          content: {
            'application/json': buildPaginatedDocs(Project, 'projects'),
          },
        },
      },
    },
  })
  list(
    @Me() me: UserRequest,
    @Paginate() paginate: PaginateQuery,
    @Query('relations') relations: string,
  ) {
    return this.projectsService.list(me, paginate, relations || '');
  }

  @Endpoint({
    method: 'POST',
    documentation: {
      summary: 'Create a new project',
      responses: {
        201: {
          description: 'Project created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  project: {
                    $ref: '#/components/schemas/ProjectSchema',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  create(@Me() me: UserRequest, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(me, createProjectDto);
  }
}
