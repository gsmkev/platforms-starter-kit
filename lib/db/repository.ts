type CrudDelegate<
  TCreate extends (...args: any[]) => any,
  TUpdate extends (...args: any[]) => any,
  TDelete extends (...args: any[]) => any,
  TFindUnique extends (...args: any[]) => any,
  TFindMany extends (...args: any[]) => any,
> = {
  create: TCreate;
  update: TUpdate;
  delete: TDelete;
  findUnique: TFindUnique;
  findMany: TFindMany;
};

/**
 * Thin wrapper around a Prisma delegate that exposes typed CRUD helpers.
 *
 * Repositories centralize all access to a given model so that API routes and
 * server actions avoid re-implementing the same queries repeatedly.
 */
export class Repository<
  TCreate extends (...args: any[]) => any,
  TUpdate extends (...args: any[]) => any,
  TDelete extends (...args: any[]) => any,
  TFindUnique extends (...args: any[]) => any,
  TFindMany extends (...args: any[]) => any,
> {
  constructor(
    private readonly delegate: CrudDelegate<
      TCreate,
      TUpdate,
      TDelete,
      TFindUnique,
      TFindMany
    >
  ) {}

  create(...args: Parameters<TCreate>): ReturnType<TCreate> {
    return this.delegate.create(...args);
  }

  update(...args: Parameters<TUpdate>): ReturnType<TUpdate> {
    return this.delegate.update(...args);
  }

  delete(...args: Parameters<TDelete>): ReturnType<TDelete> {
    return this.delegate.delete(...args);
  }

  findUnique(...args: Parameters<TFindUnique>): ReturnType<TFindUnique> {
    return this.delegate.findUnique(...args);
  }

  findMany(...args: Parameters<TFindMany>): ReturnType<TFindMany> {
    return this.delegate.findMany(...args);
  }
}

export function createRepository<
  TCreate extends (...args: any[]) => any,
  TUpdate extends (...args: any[]) => any,
  TDelete extends (...args: any[]) => any,
  TFindUnique extends (...args: any[]) => any,
  TFindMany extends (...args: any[]) => any,
>(delegate: CrudDelegate<TCreate, TUpdate, TDelete, TFindUnique, TFindMany>) {
  return new Repository(delegate);
}
