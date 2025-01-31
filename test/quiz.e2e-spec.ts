import { HttpStatus, INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module"

describe('quiz controller(e2e)', () => {
  let app: INestApplication;
  let server: any;


  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();

    server = app.getHttpServer();
  })

  it('1 - GET:sa/quiz/questions - 200', async () => {
    await request(server).get('/sa/quiz/questions').auth('admin', 'qwerty').expect(HttpStatus.OK)
  })
})
