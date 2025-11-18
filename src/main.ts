import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Log all registered routes
  const server = app.getHttpServer();
  const router = server._events.request._router;
  if (router && router.stack) {
    console.log('Registered Application Routes:');
    router.stack.forEach(function(r: any) {
      if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
      }
    });
  }

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automatically transform payloads to be objects of the DTO classes
    whitelist: true, // Remove properties that are not defined in the DTO
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transformOptions: {
      enableImplicitConversion: true, // Automatically convert primitive types
    },
  }));

  await app.listen(PORT);
}
bootstrap();
