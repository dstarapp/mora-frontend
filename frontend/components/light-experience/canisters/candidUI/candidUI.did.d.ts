export interface HttpRequest {
    url: string;
    method: string;
    body: Array<number>;
    headers: Array<[string, string]>;
}
export interface HttpResponse {
    body: Array<number>;
    headers: Array<[string, string]>;
    status_code: number;
}
export type Result = { Ok: null } | { Err: string };
export interface _SERVICE {
    binding: (arg_0: string, arg_1: string) => Promise<[] | [string]>;
    did_to_js: (did: string) => Promise<[] | [string]>;
    http_request: (arg_0: HttpRequest) => Promise<HttpResponse>;
    subtype: (arg_0: string, arg_1: string) => Promise<Result>;
}
