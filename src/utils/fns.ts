export type Result<T, E = unknown> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const tryCatch = <T, E = unknown, Fn = () => void>(
  fn: Fn,
): Result<T, E> => {
  try {
    if (typeof fn == "function") {
      return { ok: true, value: fn() };
    }
  } catch (err) {
    return { ok: false, error: err as E };
  }
  return { ok: true, value: 0 as T };
};

export const tryCatchAsync = async <T, E = unknown, Fn = () => void>(
  fn: Fn,
): Promise<Result<T, E>> => {
  try {
    if (typeof fn == "function") {
      const value = await fn();
      return { ok: true, value };
    }
  } catch (err) {
    return { ok: false, error: err as E };
  }

  return { ok: true, value: 0 as T };
};
