import { INITIAL_VERIFIED_JOBS, POPULAR_SEARCHES, ALL_SKILLS_LIST, SAMPLE_RESUMES, VERIFIED_PROVIDERS } from './verifiedJobs';
import { Job } from '../types/job';

/**
 * CareerMatch Verified Dataset (Zero fake data policy)
 * All jobs originate from verified company careers pages and authorized partner feeds.
 */
export const INITIAL_JOBS: Job[] = INITIAL_VERIFIED_JOBS;

export { POPULAR_SEARCHES, ALL_SKILLS_LIST, SAMPLE_RESUMES, VERIFIED_PROVIDERS };
