const createChanceOfFailure = (chance: number) => chance <= Math.random();

// This simulates api call time
export const callAPI = <T>(callback: () => T, chanceOfSuccess = 1): Promise<T> =>
  new Promise((resolved, reject) => {
    if (createChanceOfFailure(chanceOfSuccess)) {
      return reject('Something went wrong!');
    }
    return setTimeout(() => resolved(callback()), 1500);
  });
