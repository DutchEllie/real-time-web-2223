CREATE DATABASE IF NOT EXISTS chat;

USE chat;

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS channels;

CREATE TABLE IF NOT EXISTS channels (
	id VARCHAR(255) NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL
);

INSERT INTO channels (id, name) VALUES ('1', 'General');
INSERT INTO channels (id, name) VALUES ('2', 'test1');

CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(255) NOT NULL PRIMARY KEY,
	nickname VARCHAR(255) NOT NULL,
	channel_id VARCHAR(255),
	CONSTRAINT fk_channel_id2 FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE TABLE IF NOT EXISTS messages (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	message TEXT NOT NULL,
	username VARCHAR(255),
	user_id VARCHAR(255) NOT NULL,
	CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id),
	channel_id VARCHAR(255) NOT NULL,
	CONSTRAINT fk_channel_id FOREIGN KEY (channel_id) REFERENCES channels(id)
);
