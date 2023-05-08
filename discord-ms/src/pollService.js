import fs from "fs";

export class PollService {
  constructor() {
    // Initialize the polls array from a saved JSON file if it exists
    if (fs.existsSync("polls.json")) {
      console.log("Importing polls from polls.json");
      const savedPolls = fs.readFileSync("polls.json", "utf8");
      this.polls = JSON.parse(savedPolls);
    }
  }

  savePolls() {
    fs.writeFileSync("polls.json", JSON.stringify(this.polls));
  }

	createPoll(title, options) {
		const poll = {
			id: this.polls.length,
			title,
			options: options.map((option) => ({
				title: option.title,
				votes: 0,
			})),
		};

		this.polls.push(poll);
		this.savePolls();

		return poll;
	}

  getPolls() {
    return this.polls;
  }

  getPoll(id) {
    return this.polls.find((poll) => poll.id == id);
  }

  vote(id, vote) {
    const pollIndex = this.polls.findIndex((poll) => poll.id == id);
    if (pollIndex == -1) {
      throw new Error("Poll not found");
    }
    const optionIndex = this.polls[pollIndex].options.findIndex(
      (option) => option.title == vote
    );
    if (optionIndex == -1) {
      throw new Error("Option not found");
    }

    this.polls[pollIndex].options[optionIndex].votes++;

    this.savePolls();
  }
}
