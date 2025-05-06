import { pool } from '../db';

/**
 * Get all jobs with pagination and filtering
 */
export async function getJobs(options: {
  page?: number;
  limit?: number;
  location?: string;
  role?: string;
  search?: string;
}) {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      role,
      search
    } = options;
    
    const offset = (page - 1) * limit;
    const params: any[] = [limit, offset];
    let paramIndex = 3;
    
    let whereClause = '';
    const whereConditions = [];
    
    if (location) {
      whereConditions.push(`j.location ILIKE $${paramIndex++}`);
      params.push(`%${location}%`);
    }
    
    if (role) {
      whereConditions.push(`j.role ILIKE $${paramIndex++}`);
      params.push(`%${role}%`);
    }
    
    if (search) {
      whereConditions.push(`(
        j.title ILIKE $${paramIndex} OR
        j.company ILIKE $${paramIndex} OR
        j.description ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (whereConditions.length > 0) {
      whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    }
    
    const query = `
      SELECT 
        j.id,
        j.title,
        j.company,
        j.location,
        j.role,
        j.description,
        j.requirements,
        j.salary_min as "salaryMin",
        j.salary_max as "salaryMax",
        j.application_url as "applicationUrl",
        j.created_at as "createdAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url,
          'role', u.role
        ) as poster
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(2));
    const total = parseInt(countResult.rows[0].total);
    
    return {
      jobs: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting jobs:', error);
    throw error;
  }
}

/**
 * Get a job by ID
 */
export async function getJobById(jobId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        j.id,
        j.title,
        j.company,
        j.location,
        j.role,
        j.description,
        j.requirements,
        j.salary_min as "salaryMin",
        j.salary_max as "salaryMax",
        j.application_url as "applicationUrl",
        j.created_at as "createdAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url,
          'role', u.role
        ) as poster
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE j.id = $1
    `, [jobId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting job by ID:', error);
    throw error;
  }
}

/**
 * Create a new job
 */
export async function createJob(userId: number, jobData: {
  title: string;
  company: string;
  location: string;
  role: string;
  description: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  applicationUrl?: string;
}) {
  try {
    const result = await pool.query(`
      INSERT INTO jobs (
        user_id,
        title,
        company,
        location,
        role,
        description,
        requirements,
        salary_min,
        salary_max,
        application_url,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING 
        id, 
        title,
        company,
        location,
        role,
        description,
        requirements,
        salary_min as "salaryMin",
        salary_max as "salaryMax",
        application_url as "applicationUrl",
        created_at as "createdAt"
    `, [
      userId,
      jobData.title,
      jobData.company,
      jobData.location,
      jobData.role,
      jobData.description,
      jobData.requirements || null,
      jobData.salaryMin || null,
      jobData.salaryMax || null,
      jobData.applicationUrl || null
    ]);
    
    // Get the poster information
    const posterResult = await pool.query(`
      SELECT 
        id,
        name,
        avatar_url as "avatarUrl",
        role
      FROM users
      WHERE id = $1
    `, [userId]);
    
    return {
      ...result.rows[0],
      poster: posterResult.rows[0]
    };
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

/**
 * Update a job
 */
export async function updateJob(jobId: number, userId: number, jobData: {
  title?: string;
  company?: string;
  location?: string;
  role?: string;
  description?: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  applicationUrl?: string;
}) {
  try {
    // Build the SET clause dynamically based on provided fields
    const updates = [];
    const values = [jobId, userId];
    let paramIndex = 3;
    
    if (jobData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(jobData.title);
    }
    
    if (jobData.company !== undefined) {
      updates.push(`company = $${paramIndex++}`);
      values.push(jobData.company);
    }
    
    if (jobData.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(jobData.location);
    }
    
    if (jobData.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(jobData.role);
    }
    
    if (jobData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(jobData.description);
    }
    
    if (jobData.requirements !== undefined) {
      updates.push(`requirements = $${paramIndex++}`);
      values.push(jobData.requirements);
    }
    
    if (jobData.salaryMin !== undefined) {
      updates.push(`salary_min = $${paramIndex++}`);
      values.push(jobData.salaryMin);
    }
    
    if (jobData.salaryMax !== undefined) {
      updates.push(`salary_max = $${paramIndex++}`);
      values.push(jobData.salaryMax);
    }
    
    if (jobData.applicationUrl !== undefined) {
      updates.push(`application_url = $${paramIndex++}`);
      values.push(jobData.applicationUrl);
    }
    
    // If no fields to update, return the current job
    if (updates.length === 0) {
      return getJobById(jobId);
    }
    
    const query = `
      UPDATE jobs
      SET ${updates.join(', ')}
      WHERE id = $1 AND user_id = $2
      RETURNING 
        id, 
        title,
        company,
        location,
        role,
        description,
        requirements,
        salary_min as "salaryMin",
        salary_max as "salaryMax",
        application_url as "applicationUrl",
        created_at as "createdAt"
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      // Job not found or user doesn't have permission
      return null;
    }
    
    // Get the poster information
    const posterResult = await pool.query(`
      SELECT 
        id,
        name,
        avatar_url as "avatarUrl",
        role
      FROM users
      WHERE id = $1
    `, [userId]);
    
    return {
      ...result.rows[0],
      poster: posterResult.rows[0]
    };
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

/**
 * Delete a job
 */
export async function deleteJob(jobId: number, userId: number) {
  try {
    const result = await pool.query(`
      DELETE FROM jobs
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [jobId, userId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

/**
 * Save a job for a user
 */
export async function saveJob(userId: number, jobId: number) {
  try {
    // Check if already saved
    const checkResult = await pool.query(`
      SELECT id
      FROM saved_jobs
      WHERE user_id = $1 AND job_id = $2
    `, [userId, jobId]);
    
    if (checkResult.rows.length > 0) {
      return {
        id: checkResult.rows[0].id,
        alreadySaved: true
      };
    }
    
    // Save the job
    const result = await pool.query(`
      INSERT INTO saved_jobs (
        user_id,
        job_id,
        saved_at
      )
      VALUES ($1, $2, NOW())
      RETURNING id
    `, [userId, jobId]);
    
    return {
      id: result.rows[0].id,
      alreadySaved: false
    };
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
}

/**
 * Unsave a job for a user
 */
export async function unsaveJob(userId: number, jobId: number) {
  try {
    const result = await pool.query(`
      DELETE FROM saved_jobs
      WHERE user_id = $1 AND job_id = $2
      RETURNING id
    `, [userId, jobId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error unsaving job:', error);
    throw error;
  }
}

/**
 * Get saved jobs for a user
 */
export async function getSavedJobs(userId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        j.id,
        j.title,
        j.company,
        j.location,
        j.role,
        j.description,
        j.requirements,
        j.salary_min as "salaryMin",
        j.salary_max as "salaryMax",
        j.application_url as "applicationUrl",
        j.created_at as "createdAt",
        sj.saved_at as "savedAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url,
          'role', u.role
        ) as poster
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN users u ON j.user_id = u.id
      WHERE sj.user_id = $1
      ORDER BY sj.saved_at DESC
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    throw error;
  }
}