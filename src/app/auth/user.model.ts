export class User {
    constructor(
        public id: string,
        public email: string,
        private pToken: string,
        private pTokenExpiration: Date
    ) { }

    get token() {
        if (!this.pTokenExpiration || this.pTokenExpiration <= new Date()) {
            return null;
        }

        return this.pToken;
    }
}
