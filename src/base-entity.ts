import AsyncLock from "./async-lock";

// https://stackoverflow.com/questions/34098023
type Constructor<MODEL, ENTITY> = {
  new (model: MODEL, group: ENTITY[], lock: AsyncLock): ENTITY;
};

type LoadParams<ENTITY, LOADED> = {
  before?: () => Promise<void>;
  filter?: (one: ENTITY) => boolean;
  loader?: (array: ENTITY[]) => Promise<LOADED[]>;
  setter?: (array: ENTITY[], loaded: LOADED[]) => void;
  after?: () => Promise<void>;
};

export default class BaseEntity<
  MODEL,
  FIELD_REQUEST = undefined,
  RESPONSE = MODEL
> {
  protected _group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[];
  protected _lock: AsyncLock;

  protected constructor(
    group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[],
    lock: AsyncLock
  ) {
    this._group = group;
    this._lock = lock;
  }

  public async present(_request?: FIELD_REQUEST | true): Promise<RESPONSE> {
    throw new Error("not implemented");
  }

  protected async load<LOADED>(
    params: LoadParams<BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>, LOADED>
  ): Promise<void> {
    if (params.before) {
      await params.before();
    }

    this._lock.acquire();

    try {
      const array = this._group.filter(params.filter!);
      if (!array.length) {
        return;
      }

      const loaded = await params.loader!(array);
      params.setter!(array, loaded);
    } finally {
      this._lock.release();
    }

    if (params.after) {
      await params.after();
    }
  }

  /** factories */

  public static fromOne<MODEL, ENTITY>(
    this: Constructor<MODEL, ENTITY>,
    model: MODEL
  ): ENTITY {
    const group = new Array<ENTITY>();
    const lock = new AsyncLock();
    const entity = new this(model, group, lock);
    group.push(entity);
    return entity;
  }

  public static fromArray<MODEL, ENTITY>(
    this: Constructor<MODEL, ENTITY>,
    models: MODEL[]
  ): ENTITY[] {
    const group = new Array<ENTITY>();
    const lock = new AsyncLock();
    models.forEach((model) => group.push(new this(model, group, lock)));
    return group;
  }
}
