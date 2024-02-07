const pool = require('../db');
const { FETCH_ALL_CANDIDATES } = require('./queries');


const getScore = (yoe) => {
  if(yoe > 2) return 3;
  if (yoe > 1) return 2;
  return 1;
}

const getAllCandidates = (req, res) => {
  console.log('getting candidates');

  pool.query(FETCH_ALL_CANDIDATES, (error, results) => {
    if (error) {
      throw error;
    }
    const data = results.rows;
    const dataWithScore = data.map((candidateData) => {
      const skills = candidateData.skills;
      const score = skills.reduce((total, skill) => total + getScore(skill.experience), 0);
      return { ...candidateData, candidate_score: score };
    })
    res.status(200).json(dataWithScore);
  });
}

const registerNewCandidate = async (req, res) => {
  try {
    const { name, email, expected_salary, mobile, status, skills } = req.body;
    console.log('[D]', 'req.body: ', req.body);

    // Insert data into the candidates table
    const candidateResult = await pool.query(
      'INSERT INTO candidate(name, status, mobile, email, expected_salary) VALUES($1, $2, $3, $4, $5) RETURNING id',
      [name, status, mobile, email, expected_salary]
    );
    const candidateId = candidateResult.rows[0].id;

    // Insert data into the candidate_skills table for each skill
    const skillPromises = skills.map(async (skill) => {
      const { skill_id, experience } = skill;
      await pool.query(
        'INSERT INTO candidate_skill(candidate_id, skill_id, yoe) VALUES($1, $2, $3)',
        [candidateId, skill_id, experience]
      );
    });

    await Promise.all(skillPromises);

    res.status(201).json({ message: 'Candidate data inserted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const updateCandidate = async (req, res) => {
  const { status, candidate_id } = req.body;
  try {
    await pool.query(
      'UPDATE candidate SET status = $1 WHERE id = $2',
      [status, candidate_id]
    );
    res.status(200).json({ message: 'Candidate status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteCandidate = async (req, res) => {
  const { candidate_id } = req.body;

  // starting a transaction as we need to update in multiple tables
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM candidate_skill WHERE candidate_id = $1', [candidate_id]);
    await client.query(
      'DELETE FROM candidate WHERE id = $1',
      [candidate_id]
    );
    // Commit the transaction
    await client.query('COMMIT');
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    // Rollback the transaction on any error
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

module.exports = {
  getAllCandidates,
  registerNewCandidate,
  updateCandidate,
  deleteCandidate,
}