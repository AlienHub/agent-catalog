export type Status = 'ready' | 'accumulating' | 'unavailable';
export interface Repository {id:number;full_name:string;url:string}
export interface Growth {'7d':number|null;'30d':number|null}
export interface Activity {status:'ready'|'pending'|'unavailable';weeks:{week:number;total:number;days:number[]}[];observed_at:string|null;retry_after:string|null}
export interface Metrics {repo:Repository;stars:number;forks:number;last_commit_at:string|null;last_release:{tag:string;published_at:string;url:string}|null;observed_at:string;stale:boolean;growth:Growth;status:Status;activity:Activity}
export interface History {repo:Repository;points:{date:string;stars:number;forks:number;observed_at:string}[];growth:Growth;source:'daily_snapshots';missing_data:boolean;status:Status;stale:boolean}
export interface APIError {status?:'unavailable';error:string;retry_after?:number}
