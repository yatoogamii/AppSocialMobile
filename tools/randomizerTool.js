export function randomizerArray(
  arrayOfElement,
  amount = 1,
  repeatedElement = false,
) {
  if (amount > arrayOfElement.length && repeatedElement === false) {
    throw new Error(
      "You want more element than length of arrayOfElement, specify repeatedElement on true for fix it",
    );
  }

  if (amount > 1) {
    const result = [];

    for (let i = 0; i < amount; i++) {
      let elementAlreadyInResult = false;

      if (repeatedElement) {
        result.push(
          arrayOfElement[Math.floor(Math.random() * arrayOfElement.length)],
        );
      } else {
        while (!elementAlreadyInResult) {
          const element =
            arrayOfElement[Math.floor(Math.random() * arrayOfElement.length)];

          if (!result.includes(element)) {
            elementAlreadyInResult = true;
            result.push(element);
          }
        }
      }
    }

    return result;
  } else {
    return arrayOfElement[Math.floor(Math.random() * arrayOfElement.length)];
  }
}

export function randomizerNumber(
  arrayOfNumbers,
  amount = 1,
  repeatedElement = false,
) {
  const [min, max] = arrayOfNumbers;

  if (amount > max - min && repeatedElement === false) {
    throw new Error(
      "You want more element than length of arrayOfNumber, specify repeatedElement on true for fix it",
    );
  }

  if (amount > 1) {
    const result = [];

    for (let i = 0; i < amount; i++) {
      let elementAlreadyInResult = false;

      if (repeatedElement) {
        result.push(Math.floor(Math.random() * (max - min + 1)) + min);
      } else {
        while (!elementAlreadyInResult) {
          const element = Math.floor(Math.random() * (max - min + 1)) + min;

          if (!result.includes(element)) {
            elementAlreadyInResult = true;
            result.push(element);
          }
        }
      }
    }

    return result;
  } else {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
