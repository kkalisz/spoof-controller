
interface BaseRealtimeResponse<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: string;
  new: T;
  old: Record<string, any>;
  errors: null | string[] | Record<string, any>;
}