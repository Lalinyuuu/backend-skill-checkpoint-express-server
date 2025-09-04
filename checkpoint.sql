-- สร้างตาราง questions
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255)
);

-- สร้างตาราง answers
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT
);

-- สร้างตาราง question_votes
CREATE TABLE IF NOT EXISTS question_votes (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    vote INTEGER CHECK (vote = 1 OR vote = -1)
);

-- สร้างตาราง answer_votes
CREATE TABLE IF NOT EXISTS answer_votes (
    id SERIAL PRIMARY KEY,
    answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
    vote INTEGER CHECK (vote = 1 OR vote = -1)
);

-- Seed questions with category once to avoid duplicates
DO $$
DECLARE
    categories TEXT[] := ARRAY['technology', 'cuisine', 'travelling', 'science', 'literature', 'music', 'sports', 'movies', 'history', 'miscellaneous'];
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO questions (title, description, category)
        VALUES (
            'Question Title ' || i || ' about ' || categories[(i % array_length(categories, 1)) + 1],
            'This is a detailed description for question ' || i || '. It covers various aspects of ' || categories[(i % array_length(categories, 1)) + 1],
            categories[(i % array_length(categories, 1)) + 1]
        );
    END LOOP;
END
$$;

-- สร้างข้อมูลตัวอย่างในตาราง answers
DO $$
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO answers (question_id, content)
        VALUES (
            (SELECT id FROM questions ORDER BY RANDOM() LIMIT 1),
            'Answer ' || i || ' content goes here. It provides an in-depth explanation about ' || CASE
                WHEN i % 10 = 0 THEN 'the latest advancements in technology.'
                WHEN i % 10 = 1 THEN 'the unique flavors of different cuisines.'
                WHEN i % 10 = 2 THEN 'the best travel destinations and tips.'
                WHEN i % 10 = 3 THEN 'recent scientific studies and their implications.'
                WHEN i % 10 = 4 THEN 'famous literary works and authors.'
                WHEN i % 10 = 5 THEN 'different genres of music and popular artists.'
                WHEN i % 10 = 6 THEN 'various sports and famous athletes.'
                WHEN i % 10 = 7 THEN 'popular movies and their reviews.'
                WHEN i % 10 = 8 THEN 'significant historical events and figures.'
                ELSE 'various interesting topics.'
            END
        );
    END LOOP;
END
$$;

-- สร้างข้อมูลตัวอย่างในตาราง question_votes
DO $$
BEGIN
    FOR i IN 1..200 LOOP
        INSERT INTO question_votes (question_id, vote)
        VALUES (
            (SELECT id FROM questions ORDER BY RANDOM() LIMIT 1),
            CASE
                WHEN RANDOM() > 0.5 THEN 1
                ELSE -1
            END
        );
    END LOOP;
END
$$;

-- สร้างข้อมูลตัวอย่างในตาราง answer_votes
DO $$
BEGIN
    FOR i IN 1..200 LOOP
        INSERT INTO answer_votes (answer_id, vote)
        VALUES (
            (SELECT id FROM answers ORDER BY RANDOM() LIMIT 1),
            CASE
                WHEN RANDOM() > 0.5 THEN 1
                ELSE -1
            END
        );
    END LOOP;
END
$$;