-- Verify Vector Persistent Memory is Cleared
-- Run this to confirm all vector data was deleted along with contributions

SELECT 
    (SELECT COUNT(*) FROM contributions) as remaining_contributions,
    (SELECT COUNT(*) FROM contributions WHERE embedding IS NOT NULL) as contributions_with_embeddings,
    (SELECT COUNT(*) FROM contributions WHERE vector_x IS NOT NULL) as contributions_with_vector_x,
    (SELECT COUNT(*) FROM contributions WHERE vector_y IS NOT NULL) as contributions_with_vector_y,
    (SELECT COUNT(*) FROM contributions WHERE vector_z IS NOT NULL) as contributions_with_vector_z,
    (SELECT COUNT(*) FROM contributions WHERE embedding_model IS NOT NULL) as contributions_with_embedding_model;

-- Expected result: All counts should be 0
-- remaining_contributions | contributions_with_embeddings | contributions_with_vector_x | contributions_with_vector_y | contributions_with_vector_z | contributions_with_embedding_model
-- -----------------------+-----------------------------+---------------------------+---------------------------+---------------------------+--------------------------------
-- 0                      | 0                           | 0                         | 0                         | 0                         | 0

