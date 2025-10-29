import { GoogleAuthTokens } from "@/entities/GoogleAuthTokens";
import { DataSource, Repository } from "typeorm";


export class GoogleAuthService {
    private googleAuthTokensRepository: Repository<GoogleAuthTokens>;

    constructor(dataSource: DataSource) {
        this.googleAuthTokensRepository = dataSource.getRepository(GoogleAuthTokens);
    }

    async saveGoogleAuthTokens(googleAuthTokens: GoogleAuthTokens): Promise<GoogleAuthTokens> {
        return this.googleAuthTokensRepository.save(googleAuthTokens);
    }
}
