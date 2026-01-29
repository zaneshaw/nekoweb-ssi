# nekoweb-ssi

really bad and rushed implementation of nekoweb's new ssi system. can't guarantee this will work with your website (probably won't). things *will* break.

### supported directives
- include directive
- layout directive
- block directive

### how to use
1. clone this repo
2. install bun at https://bun.com/docs/installation
3. open a terminal in the repo's directory
4. install dependencies with `bun install`
5. configure the path to your website in `config.json`
6. run the server with `bun run main.ts`

### todo
- [ ] better parsing
- [ ] better validation
- [ ] _catchall.html
- [ ] render directive
- [ ] error directive
- [ ] list directive
- [ ] variables
