import type User from "../entities/User";

interface RequestQueueItem {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    config: RequestConfig;
}

interface RequestConfig extends RequestInit{
    url: string,
    _retry?: boolean
}

class ApiClient{
    private baseURL: string;
    private accessToken: string | null;
    private refreshPromise : Promise<string> | null;
    private restoreSessionPromise : Promise<string> | null;
    private queue: RequestQueueItem[];

    constructor(baseURL: string){
        this.accessToken = null;
        this.restoreSessionPromise = null;
        this.refreshPromise = null;
        this.queue = [];
        this.baseURL = baseURL;
    }

    private async request<T>(url: string, options: RequestInit = {}) : Promise<T>{
        const fullURL = this.baseURL + url;
        const headers = new Headers(options.headers);

        if(this.accessToken)
            headers.set('Authorization', `Bearer ${this.accessToken}`);

        const config: RequestConfig  = {...options, headers, url: fullURL};
        return this._requestWithRetry<T>(config);
    }

    private async _requestWithRetry<T>(config: RequestConfig) : Promise<T>{
        const response = await fetch(config.url, config);

        if(response.ok)
            return await response.json();

        if(response.status === 401 && !config._retry)
            return this.handleUnauthorized(config);
        
        const array = await response.json();
        if(array?.error)
            throw new Error(array?.error);

        throw new Error("UNKNOWN_ERROR");
    }

    private async handleUnauthorized<T>(originalConfig: RequestConfig) : Promise<T>{
        if(this.refreshPromise)
            return new Promise((resolve, reject) => {
                this.queue.push({ resolve, reject, config: originalConfig });
            });

        this.refreshPromise = this.refreshToken();

        try{
            const newToken = await this.refreshPromise;
            this.setAccessToken(newToken);

            const retryConfig = { ...originalConfig, _retry: true };

            const response = await fetch(retryConfig.url, retryConfig);
            if(!response.ok)
                throw new Error(`Retry failed with status ${response.status}`);
            const result = await response.json();

            this.processQueue(null, newToken);

            return result;
        }catch(error){
            this.processQueue(error, null);
            throw error;
        }finally{
            this.refreshPromise = null;
        }
    }

    private async processQueue(error: any, token: string | null){
        this.queue.forEach(({resolve, reject, config}) => {
            if(error){
                reject(error);
                return;
            }
            const newConfig = {...config, _retry: true};
            if(!newConfig.headers)
                newConfig.headers = {};
            (newConfig.headers as Headers).set('Authorization', `Bearer ${token}`);
            fetch(newConfig.url, newConfig)
            .then(res => {
                if(!res.ok)
                    throw new Error(`Retry failed with status ${res.status}`);
                return res.json();
            })
            .then(resolve)
            .catch(reject);
        });
        this.queue = [];
    }

    private async refreshToken() : Promise<string>{
        try{
            const response = await fetch(`${this.baseURL}/auth/refresh`,{
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(!response.ok)
                throw new Error("Refresh token failed");
            const data = await response.json();
            const newAccessToken = data.token;
            localStorage.setItem('accessToken', newAccessToken);
            return newAccessToken;
        }catch(error){
            this.logout();
            throw error;
        }
    }
    public setAccessToken(newAccessToken: string|null){
        this.accessToken = newAccessToken;
    }
    public logout(){
        localStorage.removeItem('accessToken');
    }
    public get<T>(url: string, options?: RequestInit) : Promise<T>{
        return this.request<T>(url, {
            ...options,
            method: "GET"
        });
    }
    public post<T>(url: string, body ?: any, options?: RequestInit): Promise<T>{
        const isFormData = body instanceof FormData;

        return this.request<T>(url, {
            ...options,
            method: "POST",
            headers: {
                ...(!isFormData && { 'Content-Type': 'application/json' }),
                ...options?.headers,
            },
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
        });
    }
    public put<T>(url: string, body?: any, options?: RequestInit): Promise<T>{
        return this.request<T>(url, {
            ...options,
            method: "PUT",
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            body: body ? JSON.stringify(body) : undefined
        });
    }
    public delete<T>(url: string, options?: RequestInit): Promise<T>{
        return this.request<T>(url,{
            ...options,
            method: "DELETE"
        })
    }
    public async restoreSession() : Promise<boolean>{
        if(this.accessToken)
            return true;
        if (this.restoreSessionPromise){
            try {
                await this.restoreSessionPromise;
                return true
            } catch (error) {
                return false
            }
        }

        this.restoreSessionPromise = this.refreshToken();

        try{
            const newToken = await this.restoreSessionPromise;
            this.setAccessToken(newToken);
            return true
        }catch(error){
            return false
        }
    }
    public me(): Promise<User>{
        return this.get<User>("/auth/me");
    }
}

export default new ApiClient("/api");