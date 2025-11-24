import { Candidate } from '../models/Candidate';

export interface ICandidateRepository {
  findById(id: number): Promise<Candidate | null>;
}

