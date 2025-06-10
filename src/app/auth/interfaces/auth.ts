export interface LoginResponse {
    data: Data;
}

export interface Data {
    login: Login;
}

export interface Login {
    token:    string;
    userType: string;
    roles:    string[];
}
