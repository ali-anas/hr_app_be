const FETCH_ALL_CANDIDATES = `
SELECT
    c.id AS candidate_id,
    c.name AS candidate_name,
    c.status AS candidate_status,
    c.expected_salary AS candidate_expected_salary,
    c.email AS candidate_email,
    c.mobile AS candidate_mobile,
    jsonb_agg(
        jsonb_build_object(
            'skill_id', s.id,
            'skill_name', s.skill_name,
            'experience', COALESCE(cs.yoe, 0)
        )
    ) AS skills
FROM
    candidate c
LEFT JOIN
    candidate_skill cs ON c.id = cs.candidate_id
LEFT JOIN
    skills s ON cs.skill_id = s.id
GROUP BY
    c.id,
    c.name,
    c.status,
    c.expected_salary
ORDER BY
    c.id;
`

module.exports =  { FETCH_ALL_CANDIDATES };