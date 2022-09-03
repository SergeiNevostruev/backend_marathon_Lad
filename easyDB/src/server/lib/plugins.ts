// import swagger
import * as Hapi from "@hapi/hapi";
import * as HapiSwagger from "hapi-swagger";
import * as Inert from "@hapi/inert";
import * as Vision from "@hapi/vision";

// options swagger
// =====================================================================================
const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
    title: "EasyBD API Documentation",
    description:
      "Документация к API базы данных EasyBD. На данный момент реализованы простые автоприсваивающиеся ключи и строковые данные. Возвращаемое время это tamestamp деленный на 1000",
  },
  tags: [
    {
      name: "Databases",
      description: "Создание и удаление баз данных",
    },
    {
      name: "Collections",
      description: "Создание и удаление коллекций внутри баз данных",
    },
    {
      name: "Repository",
      description: "Добавление и удаление, изменение данных из коллекций",
    },
  ],
  grouping: "tags",
  sortEndpoints: "method",
  produces: ["application/json"],
  jsonPath: "/documentation.json",
  documentationPath: "/documentation",
  schemes: ["http", "https"],
  debug: true,
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
    },
  },
};

const plugins: Array<Hapi.ServerRegisterPluginObject<any>> = [
  {
    plugin: Inert,
  },
  {
    plugin: Vision,
  },
  {
    plugin: HapiSwagger,
    options: swaggerOptions,
  },
];

export default plugins;
