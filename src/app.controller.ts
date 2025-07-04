import { Controller } from '@nestjs/common';
import { Endpoint } from './helpers/decorators/endpoint.decorator';

@Controller('test')
export class AppController {
  @Endpoint({
    method: 'GET',
    isPublic: true,
    cache: {
      disable: true,
    },
  })
  testEndpoint() {
    return [
      {
        title: 'Em andamento',
        value: Math.floor(Math.random() * 100) + 1, // Random value between 1 and 100
        color: '#3b82f6', // #1E40FF
      },
      {
        title: 'Concluídas',
        value: Math.floor(Math.random() * 100) + 1, // Random value between 1 and 100
        color: '#22c55e', // #16A34A
      },
      {
        title: 'Canceladas',
        value: Math.floor(Math.random() * 100) + 1,
        color: '#ef4444', // #DC2626
      },
      {
        title: 'Agendadas',
        value: Math.floor(Math.random() * 100) + 1,
        color: '#8B5CF6', // #8B5CF6
      },
      {
        title: 'Atrasadas',
        value: Math.floor(Math.random() * 100) + 1,
        color: '#F97316', // #F97316
      },
    ];
  }
}
