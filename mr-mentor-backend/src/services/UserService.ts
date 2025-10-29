import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/User';

export interface CreateUserDto {
  fullName: string;
  email: string;
  phone?: string;
  profession?: string;
  domain?: string;
  profilePhoto?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  profession?: string;
  domain?: string;
  profilePhoto?: string;
}

export class UserService {
  private userRepository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(userData);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async updateUser(id: string, userData: UpdateUserDto): Promise<User | null> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        return null;
      }
      Object.assign(user, userData);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getUserCount(): Promise<number> {
    try {
      return await this.userRepository.count();
    } catch (error) {
      throw new Error(`Failed to count users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return !!user;
    } catch (error) {
      throw new Error(`Failed to check email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getUserWithTokens(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ 
        where: { id },
        select:{
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profession: true,
          domain: true,
          profilePhoto: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          tokens: true
        },
        relations: ['tokens']
      });
    } catch (error) {
      throw new Error(`Failed to fetch user with tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}