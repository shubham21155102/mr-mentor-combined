import { User } from "@/entities/User";

export interface MentorResponse {
  status: string;
  mentors: User[];
}
