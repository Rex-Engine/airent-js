import AsyncLock from "async-lock";
type EntityConstructor<MODEL, ENTITY> = {
    new (model: MODEL, group: ENTITY[], lock: AsyncLock): ENTITY;
};
type LoadKey = Record<string, any>;
type LoadConfig<ENTITY, LOADED> = {
    name: string;
    filter: (one: ENTITY) => boolean;
    getter?: (sources: ENTITY[]) => LoadKey[];
    loader?: (keys: LoadKey[]) => Promise<LOADED[]>;
    setter?: (sources: ENTITY[], targets: LOADED[]) => void;
};
declare class BaseEntity<MODEL, FIELD_REQUEST = undefined, RESPONSE = MODEL> {
    protected _group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[];
    protected _lock: AsyncLock;
    protected constructor(group: BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>[], lock: AsyncLock);
    protected initialize(): void;
    present(_fieldRequest: FIELD_REQUEST): Promise<RESPONSE>;
    protected load<ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>, LOADED>(config: LoadConfig<ENTITY, LOADED>): Promise<void>;
    /** factories */
    static fromOne<MODEL, ENTITY>(this: EntityConstructor<MODEL, ENTITY>, model: MODEL): ENTITY;
    static fromArray<MODEL, ENTITY>(this: EntityConstructor<MODEL, ENTITY>, models: MODEL[]): ENTITY[];
    static presentMany<MODEL, FIELD_REQUEST, RESPONSE, ENTITY extends BaseEntity<MODEL, FIELD_REQUEST, RESPONSE>>(entities: ENTITY[], fieldRequest: FIELD_REQUEST): Promise<any[]>;
}
declare function toArrayMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE[]>;
declare function toObjectMap<OBJECT, KEY, VALUE>(objects: OBJECT[], keyMapper: (object: OBJECT) => KEY, valueMapper: (object: OBJECT) => VALUE): Map<KEY, VALUE>;
export { AsyncLock, BaseEntity, EntityConstructor, LoadConfig, LoadKey, toArrayMap, toObjectMap, };
