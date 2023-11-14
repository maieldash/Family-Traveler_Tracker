
DROP TABLE IF EXISTS countries, visited_countries, users;

CREATE TABLE countries(
id SERIAL PRIMARY KEY,
countrycode CHAR(2) NOT NULL,
countryname CHAR(100) NOT NULL
);

-- import the countries.csv file countries table in the db. --


CREATE TABLE users(
id SERIAL PRIMARY KEY,
name VARCHAR(25) UNIQUE NOT NULL,
color VARCHAR(25)
);

CREATE TABLE visited_countries(
id SERIAL PRIMARY KEY,
countrycode CHAR(2) NOT NULL,
user_id INTEGER REFERENCES users(id)
);

INSERT INTO users (name, color)
VALUES ('Micky', 'teal'), ('Lily', 'powderblue');

INSERT INTO visited_countries (countrycode, user_id)
VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2 );

SELECT *
FROM visited_countries
JOIN users
ON users.id = user_id;