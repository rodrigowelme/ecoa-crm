import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ecoa CRM API')
    .setDescription(
      'API para gerenciamento do funil de vendas, vendedores e negócios do Ecoa CRM.',
    )
    .setVersion('1.0.0')
    .addTag('Stages', 'Etapas do funil de vendas')
    .addTag('Sellers', 'Vendedores')
    .addTag('Deals', 'Gerenciamento de negócios')
    .build();

  const document = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Ecoa CRM | API Docs',
  });

  await app.listen(process.env.PORT ?? 3000, () =>
    logger.log(`Server is running on port ${process.env.PORT ?? 3000}`),
  );
}

await bootstrap();
