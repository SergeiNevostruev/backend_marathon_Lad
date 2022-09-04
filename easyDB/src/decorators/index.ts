export const TryCatch = (message: string) =>
  function (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> {
    // Запоминаем исходную функцию
    const originalMethod = descriptor.value;
    // Подменяем ее на нашу обертку
    descriptor.value = async function (...args: any[]) {
      try {
        // Вызываем исходный метод
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (er) {
        // Просто выводим в консоль, исполнение кода будет продолжено
        console.error(message);
        // console.error(er); // для отладки
        // console.log(args); // для отладки
        // console.log(propertyKey); // для отладки
        return false;
      }
    };
    // Обновляем дескриптор
    return descriptor;
  };
